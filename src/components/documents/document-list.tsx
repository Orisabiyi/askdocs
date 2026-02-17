"use client";

import { useState } from "react";
import { FileText, Trash2, Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Document {
  id: string;
  name: string;
  fileType: string;
  fileSize: number;
  pageCount: number | null;
  chunkCount: number | null;
  status: string;
  createdAt: string;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "PROCESSING":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Processing
        </span>
      );
    case "READY":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Ready
        </span>
      );
    case "FAILED":
      return (
        <span className="inline-flex items-center gap-1 text-[11px] text-red-500">
          <AlertCircle className="h-3 w-3" />
          Failed
        </span>
      );
    default:
      return null;
  }
}

export default function DocumentList({
  documents,
  onDeleteAction,
}: {
  documents: Document[];
  onDeleteAction: (id: string) => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      if (res.ok) onDeleteAction(id);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 mb-4">
          <FileText className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No documents yet. Upload one above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <motion.div
          key={doc.id}
          className="flex items-center gap-4 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          layout
        >
          <FileText className="h-4 w-4 shrink-0 text-zinc-400" />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
              {doc.name}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                {formatFileSize(doc.fileSize)}
              </span>
              {doc.pageCount && (
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {doc.pageCount} pages
                </span>
              )}
              {doc.chunkCount && (
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  {doc.chunkCount} chunks
                </span>
              )}
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(doc.createdAt)}
              </span>
            </div>
          </div>

          <StatusBadge status={doc.status} />

          <button
            onClick={() => handleDelete(doc.id)}
            disabled={deletingId === doc.id}
            className="shrink-0 rounded-md p-1.5 text-zinc-300 dark:text-zinc-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {deletingId === doc.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </motion.div>
      ))}
    </div>
  );
}