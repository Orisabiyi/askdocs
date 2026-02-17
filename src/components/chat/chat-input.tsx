"use client";

import { useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ChatInput({
  onSendAction,
  disabled,
}: {
  onSendAction: (message: string) => void;
  disabled?: boolean;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || disabled) return;
    onSendAction(message.trim());
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your documents..."
        rows={1}
        disabled={disabled}
        className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3 pr-12 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 disabled:opacity-50"
        style={{ minHeight: "48px", maxHeight: "160px" }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = "48px";
          target.style.height = `${Math.min(target.scrollHeight, 160)}px`;
        }}
      />
      <button
        type="submit"
        disabled={!message.trim() || disabled}
        className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 disabled:opacity-30 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </form>
  );
}