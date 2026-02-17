"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Loader2 } from "lucide-react";

export default function ChatIndexPage() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  const createChat = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (res.ok) {
        const chat = await res.json();
        router.push(`/chat/${chat.id}`);
      }
    } catch {
      console.error("Failed to create chat");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 mb-4">
        <MessageSquare className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
      </div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
        Welcome to AskDocs
      </h2>
      <p className="text-[13px] text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">
        Upload documents, then start a conversation to ask questions about them.
        Every answer comes with citations.
      </p>
      <button
        onClick={createChat}
        disabled={creating}
        className="inline-flex items-center gap-2 rounded-md bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
      >
        {creating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <MessageSquare className="h-3.5 w-3.5" />
        )}
        Start a conversation
      </button>
    </div>
  );
}