export interface Citation {
  chunkId: string;
  documentName: string;
  pageNumber: number | null;
  score: number;
  text: string;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: Citation[];
  createdAt: Date;
}

export interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
}

export interface StreamingMessage {
  role: "USER" | "ASSISTANT";
  content: string;
  citations?: Citation[];
  isStreaming?: boolean;
}