"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import MessageBubble from "@/components/chat/message-bubble";
import ChatInput from "@/components/chat/chat-input";
import { Loader2, FileText, AlertCircle, RotateCcw } from "lucide-react";
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
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(
    null
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const initDone = useRef(false);

  // Stable fetch function that takes chatId as argument to avoid stale closures
  const fetchMessages = useCallback(
    async (id: string): Promise<Message[]> => {
      try {
        console.log("[AskDocs] Fetching messages for chat:", id);
        const res = await fetch(`/api/chat/${id}/messages`);
        console.log("[AskDocs] Response status:", res.status);

        if (!res.ok) {
          console.error("[AskDocs] Failed to fetch messages:", res.status);
          return [];
        }

        const data = await res.json();
        console.log("[AskDocs] Messages fetched:", data.length);

        // Normalize role casing — DB might store lowercase
        return data.map(
          (msg: {
            id: string;
            role: string;
            content: string;
            citations?: Citation[];
            createdAt: string;
          }) => ({
            ...msg,
            role: msg.role.toUpperCase() as "USER" | "ASSISTANT",
          })
        );
      } catch (err) {
        console.error("[AskDocs] Fetch messages error:", err);
        return [];
      }
    },
    []
  );

  // Send message function
  const sendMessage = useCallback(
    async (content: string) => {
      if (!chatId) return;

      setError(null);
      setLastFailedMessage(null);

      // Add optimistic user message
      setMessages((prev) => {
        const clean = prev.filter((m) => !m.id.startsWith("temp-"));
        return [
          ...clean,
          {
            id: `temp-user-${Date.now()}`,
            role: "USER" as const,
            content,
            createdAt: new Date().toISOString(),
          },
        ];
      });

      setStreaming(true);
      setStreamingContent("");

      try {
        const res = await fetch(`/api/chat/${chatId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Request failed (${res.status})`);
        }

        if (!res.body) {
          throw new Error("No response body");
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
              if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (e) {
              if (
                e instanceof Error &&
                e.message !== "Unexpected end of JSON input"
              ) {
                throw e;
              }
            }
          }
        }

        if (!fullContent) {
          throw new Error("Empty response from AI");
        }

        // Replace all messages with authoritative server data
        const serverMessages = await fetchMessages(chatId);
        setMessages(serverMessages);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
        setLastFailedMessage(content);

        // Sync with server
        const serverMessages = await fetchMessages(chatId);
        if (serverMessages.length > 0) {
          setMessages(serverMessages);
        }
      } finally {
        setStreaming(false);
        setStreamingContent("");
      }
    },
    [chatId, fetchMessages]
  );

  // Keep a ref to sendMessage for the init effect
  const sendMessageRef = useRef(sendMessage);
  sendMessageRef.current = sendMessage;

  // Load messages when chatId changes
  useEffect(() => {
    if (!chatId) return;

    let cancelled = false;
    initDone.current = false;

    // Reset everything for the new chat
    setMessages([]);
    setError(null);
    setStreamingContent("");
    setStreaming(false);
    setLoading(true);

    const init = async () => {
      const data = await fetchMessages(chatId);

      if (cancelled) return;

      setMessages(data);
      setLoading(false);

      // Auto-send first message from ?q= param
      const initialMessage = searchParams.get("q");
      if (initialMessage && data.length === 0 && !initDone.current) {
        initDone.current = true;
        window.history.replaceState({}, "", `/chat/${chatId}`);
        // Small delay to let React render
        setTimeout(() => {
          sendMessageRef.current(initialMessage);
        }, 100);
      }
    };

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, fetchMessages]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 && !streaming && !error ? (
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
                citations={msg.citations as Citation[] | undefined}
              />
            ))}

            {streaming && streamingContent && (
              <MessageBubble
                role="ASSISTANT"
                content={streamingContent}
                isStreaming
              />
            )}

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

            {/* Error state */}
            {error && (
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                </div>
                <div className="space-y-2">
                  <div className="rounded-2xl rounded-bl-none border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 px-4 py-2.5">
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                  {lastFailedMessage && (
                    <button
                      onClick={() => sendMessage(lastFailedMessage)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 text-[12px] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Retry
                    </button>
                  )}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <ChatInput onSendAction={sendMessage} disabled={streaming} />
        </div>
      </div>
    </div>
  );
}