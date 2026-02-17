"use client";

import { useState } from "react";
import { FileText, Globe, User, Bot, ChevronDown, ExternalLink, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Citation } from "@/types/chat";
import { motion, AnimatePresence } from "framer-motion";
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
  const [expandedCitation, setExpandedCitation] = useState<number | null>(null);

  const docCitations = citations?.filter((c) => c.type === "document") || [];
  const webCitations = citations?.filter((c) => c.type === "web") || [];

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
      <div className={`max-w-[75%] space-y-2.5 ${isUser ? "items-end" : ""}`}>
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

        {/* Document Citations */}
        {docCitations.length > 0 && (
          <div className="space-y-1.5 pl-1">
            <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Sources from your documents
            </p>
            <div className="space-y-1">
              {docCitations.map((citation, i) => (
                <DocumentCitationCard
                  key={i}
                  citation={citation}
                  index={i}
                  isExpanded={expandedCitation === i}
                  onToggle={() =>
                    setExpandedCitation(expandedCitation === i ? null : i)
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* Web Citations */}
        {webCitations.length > 0 && (
          <div className="space-y-1.5 pl-1">
            <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Web sources
            </p>
            <div className="flex flex-wrap gap-1.5">
              {webCitations.map((citation, i) => (
                <WebCitationBadge key={i} citation={citation} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DocumentCitationCard({
  citation,
  index,
  isExpanded,
  onToggle,
}: {
  citation: Citation;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  if (citation.type !== "document") return null;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
          {index + 1}
        </div>
        <FileText className="h-3 w-3 shrink-0 text-zinc-400" />
        <span className="text-[12px] font-medium text-zinc-700 dark:text-zinc-300 truncate flex-1">
          {citation.documentName}
        </span>
        {citation.score && (
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0">
            {Math.round(citation.score * 100)}% match
          </span>
        )}
        <ChevronDown
          className={`h-3 w-3 shrink-0 text-zinc-400 transition-transform ${isExpanded ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-100 dark:border-zinc-800 px-3 py-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  Source passage
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle();
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
              <p className="text-[12px] text-zinc-600 dark:text-zinc-400 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                {citation.text || "Source text not available."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function WebCitationBadge({ citation }: { citation: Citation }) {
  if (citation.type !== "web") return null;

  return (
    <Link
      href={citation.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2.5 py-1.5 text-[12px] text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
    >
      <Globe className="h-3 w-3 shrink-0 text-zinc-400" />
      <span className="truncate max-w-[200px]">{citation.sourceName}</span>
      <ExternalLink className="h-2.5 w-2.5 shrink-0 text-zinc-300 dark:text-zinc-500 group-hover:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors" />
    </Link>
  );
}