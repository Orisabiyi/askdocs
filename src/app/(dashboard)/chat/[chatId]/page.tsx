"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import MessageBubble from "@/components/chat/message-bubble";
import ChatInput from "@/components/chat/chat-input";
import { Loader2, FileText } from "lucide-react";
import type { Citation } from "@/types/chat";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: Citation[];
  createdAt: string;
}

export default function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamingCitations, setStreamingCitations] = useState<Citation[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/chat/${chatId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch {
        console.error("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setStreaming(true);
    setStreamingContent("");
    setStreamingCitations([]);

    try {
      const res = await fetch(`/api/chat/${chatId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Failed to send message");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);

          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);

            if (parsed.text) {
              fullContent += parsed.text;
              setStreamingContent(fullContent);
            }

            if (parsed.citations) {
              setStreamingCitations(parsed.citations);
            }

            if (parsed.error) {
              console.error("Stream error:", parsed.error);
            }
          } catch {
            // Skip malformed JSON
          }
        }
      }

      // Replace streaming with final message
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "ASSISTANT",
          content: fullContent,
          citations: JSON.parse(JSON.stringify(streamingCitations)),
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setStreaming(false);
      setStreamingContent("");
      setStreamingCitations([]);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !streaming ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 mb-4">
              <FileText className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
            </div>
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
              Ask your documents anything
            </h3>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-sm">
              Type a question below. AskDocs will search your uploaded documents
              and give you an answer with citations.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                citations={msg.citations}
              />
            ))}

            {/* Streaming message */}
            {streaming && streamingContent && (
              <MessageBubble
                role="ASSISTANT"
                content={streamingContent}
                isStreaming
              />
            )}

            {/* Loading indicator */}
            {streaming && !streamingContent && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-400" />
                </div>
                <div className="rounded-2xl rounded-bl-none border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-bounce" />
                    <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-bounce [animation-delay:0.1s]" />
                    <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600 animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendAction={sendMessage} disabled={streaming} />
        </div>
      </div>
    </div>
  );
}