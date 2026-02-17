"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadFile {
  file: File;
  status: "uploading" | "success" | "error";
  message?: string;
}

export default function UploadZone({
  onUploadCompleteAction,
}: {
  onUploadCompleteAction: () => void;
}) {
  const [files, setFiles] = useState<UploadFile[]>([]);

  const uploadFile = async (file: File) => {
    setFiles((prev) => [...prev, { file, status: "uploading" }]);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setFiles((prev) =>
          prev.map((f) =>
            f.file === file
              ? { ...f, status: "error", message: data.error }
              : f
          )
        );
        return;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, status: "success" } : f
        )
      );
      onUploadCompleteAction();
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? { ...f, status: "error", message: "Upload failed" }
            : f
        )
      );
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    acceptedFiles.forEach(uploadFile);
  };

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    maxSize: 20 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive
          ? "border-zinc-400 dark:border-zinc-500 bg-zinc-50 dark:bg-zinc-800/50"
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
          }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700">
            <Upload className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {isDragActive ? "Drop files here" : "Drop files or click to upload"}
            </p>
            <p className="mt-1 text-[13px] text-zinc-500 dark:text-zinc-400">
              PDF, DOCX, TXT, or Markdown — up to 20MB
            </p>
          </div>
        </div>
      </div>

      {/* Upload list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {files.map((f, i) => (
              <motion.div
                key={`${f.file.name}-${i}`}
                className="flex items-center gap-3 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-3"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FileText className="h-4 w-4 shrink-0 text-zinc-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                    {f.file.name}
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">
                    {(f.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {f.status === "uploading" && (
                  <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                )}
                {f.status === "success" && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
                {f.status === "error" && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-red-500">{f.message}</span>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(f.file);
                  }}
                  className="shrink-0 text-zinc-300 dark:text-zinc-600 hover:text-zinc-500 dark:hover:text-zinc-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}