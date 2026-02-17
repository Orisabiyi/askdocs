"use client";

import { useState, useEffect, useCallback } from "react";
import UploadZone from "@/components/documents/upload-zone";
import DocumentList from "@/components/documents/document-list";
import { Loader2 } from "lucide-react";

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

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch {
      console.error("Failed to fetch documents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Poll for processing documents
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "PROCESSING");
    if (!hasProcessing) return;

    const interval = setInterval(fetchDocuments, 3000);
    return () => clearInterval(interval);
  }, [documents, fetchDocuments]);

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Documents
        </h1>
        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1">
          Upload and manage your documents. Once processed, you can ask
          questions about them in chat.
        </p>
      </div>

      <UploadZone onUploadCompleteAction={fetchDocuments} />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
        </div>
      ) : (
        <DocumentList documents={documents} onDeleteAction={handleDelete} />
      )}
    </div>
  );
}