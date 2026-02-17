"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MessageSquare, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

export default function ChatSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChats();
  }, [pathname]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch {
      console.error("Failed to fetch chats");
    } finally {
      setLoading(false);
    }
  };

  const activeChatId = pathname.split("/chat/")[1];

  return (
    <div className="flex flex-col h-full">
      <button
        onClick={() => router.push("/chat")}
        className="flex items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors mx-3 mt-3"
      >
        <Plus className="h-3.5 w-3.5" />
        New Chat
      </button>

      <div className="flex-1 overflow-y-auto mt-3 px-3 space-y-0.5">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          </div>
        ) : chats.length === 0 ? (
          <p className="text-[13px] text-zinc-400 dark:text-zinc-500 text-center py-8">
            No conversations yet
          </p>
        ) : (
          chats.map((chat) => (
            <motion.button
              key={chat.id}
              onClick={() => router.push(`/chat/${chat.id}`)}
              className={`flex items-center gap-2 w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${activeChatId === chat.id
                  ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{chat.title}</span>
            </motion.button>
          ))
        )}
      </div>
    </div>
  );
}