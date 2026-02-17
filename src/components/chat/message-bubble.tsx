"use client";

import { FileText, Globe, User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Citation } from "@/types/chat";
import { motion } from "framer-motion";
import Link from "next/link";

interface MessageBubbleProps {
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
}

export default function MessageBubble({
  role,
  content,
  citations,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = role === "USER";

  return (
    <motion.div
      className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Avatar */}
      <div
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${isUser
          ? "border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
          }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-zinc-500" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-zinc-500" />
        )}
      </div>

      {/* Content */}
      <div className={`max-w-[75%] space-y-2 ${isUser ? "items-end" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isUser
            ? "rounded-br-none bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
            : "rounded-bl-none border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            }`}
        >
          {isUser ? (
            <p>{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert prose-p:my-1.5 prose-headings:my-2 max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-1.5 h-4 bg-zinc-400 dark:bg-zinc-500 animate-pulse ml-0.5 align-middle" />
              )}
            </div>
          )}
        </div>

        {/* Citations */}
        {citations && citations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {citations.map((citation, i) => (
              <CitationBadge key={i} citation={citation} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function CitationBadge({ citation }: { citation: Citation }) {
  if (citation.type === "document") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
        title={citation.text}
      >
        <FileText className="h-3 w-3" />
        {citation.documentName}
      </span>
    );
  }

  return (
    <Link
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-1 text-[11px] text-zinc-500 dark:text-zinc-400 cursor-pointer hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
    >
      <Globe className="h-3 w-3" />
      {citation.sourceName}
    </Link>
  );
}