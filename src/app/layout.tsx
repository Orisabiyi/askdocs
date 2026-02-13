import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/session-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AskDocs — AI-Powered Document Q&A",
  description:
    "Upload documents, ask questions, get accurate answers with citations. Powered by RAG pipeline with Gemini AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthSessionProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthSessionProvider>
      </body>
    </html>
  );
}