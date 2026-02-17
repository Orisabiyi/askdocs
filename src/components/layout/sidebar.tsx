"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  MessageSquare,
  FileText,
  FolderOpen,
  Plus,
  Trash2,
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface Chat {
  id: string;
  title: string;
  updatedAt: string;
}

const navItems = [
  { href: "/documents", icon: FileText, label: "Documents" },
  { href: "/collections", icon: FolderOpen, label: "Collections" },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

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
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [pathname]);

  const deleteChat = async (chatId: string) => {
    setDeletingId(chatId);
    try {
      const res = await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
      if (res.ok) {
        setChats((prev) => prev.filter((c) => c.id !== chatId));
        if (pathname === `/chat/${chatId}`) {
          router.push("/chat");
        }
      }
    } catch {
      console.error("Failed to delete chat");
    } finally {
      setDeletingId(null);
      setMenuOpenId(null);
    }
  };

  const activeChatId = pathname.startsWith("/chat/")
    ? pathname.split("/chat/")[1]
    : null;

  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
          askdocs<span className="text-zinc-300 dark:text-zinc-600">.</span>
        </Link>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pt-3">
        <button
          onClick={() => router.push("/chat")}
          className="flex w-full items-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
        <p className="px-2 mb-1.5 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Conversations
        </p>

        {loadingChats ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          </div>
        ) : chats.length === 0 ? (
          <p className="px-2 py-4 text-[13px] text-zinc-400 dark:text-zinc-500">
            No conversations yet
          </p>
        ) : (
          <div className="space-y-0.5">
            {chats.map((chat) => (
              <div key={chat.id} className="relative group">
                <button
                  onClick={() => router.push(`/chat/${chat.id}`)}
                  className={`flex items-center gap-2 w-full rounded-md px-2 py-1.5 text-left text-[13px] transition-colors ${activeChatId === chat.id
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                    }`}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate flex-1">{chat.title}</span>
                </button>

                {/* Menu trigger */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(menuOpenId === chat.id ? null : chat.id);
                  }}
                  className={`absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 transition-opacity ${menuOpenId === chat.id
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                    } text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700`}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>

                {/* Delete dropdown */}
                <AnimatePresence>
                  {menuOpenId === chat.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="absolute right-0 top-full mt-1 z-50 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-lg py-1 min-w-[120px]"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        disabled={deletingId === chat.id}
                        className="flex w-full items-center gap-2 px-3 py-1.5 text-[13px] text-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                      >
                        {deletingId === chat.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                        Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-3 py-2 space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${pathname.startsWith(href)
              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </div>

      {/* User info */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <p className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100 truncate">
          {user.name || "User"}
        </p>
        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
          {user.email}
        </p>
      </div>
    </aside>
  );
}