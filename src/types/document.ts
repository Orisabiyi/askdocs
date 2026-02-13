export type DocumentStatus = "PROCESSING" | "READY" | "FAILED";

export interface Document {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  pageCount: number;
  chunkCount: number;
  status: DocumentStatus;
  createdAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  pageNumber: number | null;
  chunkIndex: number;
}

export interface UploadProgress {
  fileName: string;
  status: "uploading" | "parsing" | "chunking" | "embedding" | "ready" | "failed";
  progress: number;
  error?: string;
}