import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { extractText, chunkText } from "@/lib/documents";
import { generateEmbedding } from "@/lib/gemini";
import { pineconeIndex } from "@/lib/pinecone";
import prisma from "@/lib/prisma";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Unsupported file type. Upload PDF, DOCX, or TXT files." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 20MB limit." },
        { status: 400 }
      );
    }

    // Create document record with PROCESSING status
    const document = await prisma.document.create({
      data: {
        name: file.name,
        fileType: file.type,
        fileSize: file.size,
        status: "PROCESSING",
        userId: session.user.id,
      },
    });

    // Process in background (non-blocking response)
    processDocument(document.id, file).catch((error) => {
      console.error(`Failed to process document ${document.id}:`, error);
    });

    return NextResponse.json(
      { message: "Document uploaded", documentId: document.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

async function processDocument(documentId: string, file: File) {
  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    // 1. Extract text
    const { text, pageCount } = await extractText(buffer, file.type);

    if (!text || text.trim().length === 0) {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: "FAILED" },
      });
      return;
    }

    // 2. Chunk text
    const chunks = chunkText(text);

    // 3. Generate embeddings and upsert to Pinecone
    const pineconeVectors: {
      id: string;
      values: number[];
      metadata: Record<string, string | number>;
    }[] = [];

    const dbChunks: {
      content: string;
      chunkIndex: number;
      embeddingId: string;
      documentId: string;
    }[] = [];

    for (let i = 0; i < chunks.length; i++) {
      const embedding = await generateEmbedding(chunks[i]);
      const embeddingId = `${documentId}_chunk_${i}`;

      pineconeVectors.push({
        id: embeddingId,
        values: embedding,
        metadata: {
          documentId,
          chunkIndex: i,
          text: chunks[i].substring(0, 1000), // Pinecone metadata limit
        },
      });

      dbChunks.push({
        content: chunks[i],
        chunkIndex: i,
        embeddingId,
        documentId,
      });
    }

    // Batch upsert to Pinecone (max 100 per batch)
    for (let i = 0; i < pineconeVectors.length; i += 100) {
      const batch = pineconeVectors.slice(i, i + 100);
      await pineconeIndex.upsert({ records: batch });
    }

    // 4. Save chunks to database
    await prisma.chunk.createMany({ data: dbChunks });

    // 5. Update document status
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "READY",
        pageCount,
        chunkCount: chunks.length,
        pineconeIds: pineconeVectors.map((v) => v.id),
      },
    });
  } catch (error) {
    console.error(`Processing failed for document ${documentId}:`, error);
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED" },
    });
  }
}