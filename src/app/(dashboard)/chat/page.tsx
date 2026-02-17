"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, FileText, Search, Quote, Loader2 } from "lucide-react";

const suggestions = [
  "What are the key terms in my contract?",
  "Summarize the main findings of this report",
  "Are there any compliance risks in this document?",
  "Compare the termination clauses across my documents",
];

export default function ChatIndexPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (content: string) => {
    if (!content.trim() || sending) return;
    setSending(true);

    try {
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: content.substring(0, 80) }),
      });

      if (!chatRes.ok) throw new Error("Failed to create chat");
      const chat = await chatRes.json();

      router.push(`/chat/${chat.id}?q=${encodeURIComponent(content)}`);
    } catch {
      console.error("Failed to start chat");
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {/* Spacer to push content to center */}
      <div className="flex-1" />

      {/* Center content */}
      <div className="w-full max-w-2xl mx-auto px-4 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            What do you want to know?
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Ask anything about your uploaded documents
          </p>
        </div>

        {/* Suggestions */}
        <div className="grid grid-cols-2 gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSend(suggestion)}
              disabled={sending}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 text-left text-[13px] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        {/* Capabilities */}
        <div className="flex items-center justify-center gap-6">
          {[
            { icon: FileText, label: "Reads your docs" },
            { icon: Search, label: "Searches the web" },
            { icon: Quote, label: "Cites every claim" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500"
            >
              <Icon className="h-3 w-3" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Input pinned to bottom */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <div className="max-w-2xl mx-auto relative">
          <form onSubmit={handleSubmit}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your documents..."
              rows={1}
              disabled={sending}
              autoFocus
              className="w-full resize-none rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-4 pr-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:opacity-50 shadow-sm"
              style={{ minHeight: "56px", maxHeight: "160px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "56px";
                target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
              }}
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-30 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}