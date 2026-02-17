import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { retrieveRelevantChunks, buildRAGPrompt } from "@/lib/rag";
import { geminiChatModel } from "@/lib/gemini";
import type { Citation } from "@/types/chat";
import { NextResponse } from "next/server";

// GET - fetch messages for a chat
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { chatId } = await params;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Chat not found" }), {
        status: 404,
      });
    }

    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
    });

    return new Response(JSON.stringify(messages), { status: 200 });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}

// POST - send a message and stream AI response
export async function POST(
  req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { chatId } = await params;
    const { content } = await req.json();

    if (!content?.trim()) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
      });
    }

    // Verify chat ownership
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Chat not found" }), {
        status: 404,
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        chatId,
        role: "USER",
        content,
      },
    });

    // Get user location for context
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { country: true, state: true },
    });

    // Retrieve relevant chunks from documents
    const chunks = await retrieveRelevantChunks(content, session.user.id);

    console.log("Retrieved chunks:", chunks.length);
    console.log("Chunk scores:", chunks.map((c) => ({ name: c.documentName, score: c.score })));

    // Build citations
    const citations: Citation[] = chunks.map((chunk) => ({
      type: "document" as const,
      chunkId: chunk.chunkId,
      documentName: chunk.documentName,
      pageNumber: null,
      score: chunk.score,
      text: chunk.content,
    }));

    // Build RAG prompt
    const prompt = buildRAGPrompt(content, chunks, {
      country: user?.country || null,
      state: user?.state || null,
    });

    // Get conversation history for context (last 10 messages)
    const history = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "asc" },
      take: 10,
    });

    const geminiHistory = history.slice(0, -1).map((msg) => ({
      role: msg.role === "USER" ? "user" : ("model" as const),
      parts: [{ text: msg.content }],
    }));

    const chatSession = geminiChatModel.startChat({
      history: geminiHistory,
    });

    const result = await chatSession.sendMessageStream(prompt);

    // Auto-generate title from first message
    if (chat.title === "New Chat") {
      const titleSlice = content.substring(0, 80);
      prisma.chat
        .update({
          where: { id: chatId },
          data: { title: titleSlice },
        })
        .catch(() => { });
    }

    // Stream response using SSE
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponse += text;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }

          // Check for web search grounding metadata
          const response = await result.response;
          const candidate = response.candidates?.[0];
          const groundingMetadata =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (candidate as any)?.groundingMetadata;
          const webCitations: Citation[] = [];

          if (groundingMetadata) {
            // Extract from grounding chunks
            const chunks = groundingMetadata.groundingChunks || [];

            // Build a map of unique web sources
            const seen = new Set<string>();

            for (const chunk of chunks) {
              const web = chunk.web || chunk.retrievedContext;
              if (web) {
                const uri = web.uri || web.url || "";
                const title = web.title || web.displayName || "Web source";

                if (uri && !seen.has(uri)) {
                  seen.add(uri);
                  webCitations.push({
                    type: "web",
                    url: uri,
                    sourceName: title,
                    snippet: "",
                  });
                }
              }
            }

            // If we got titles but no URLs, try to extract from search queries
            if (
              webCitations.length === 0 &&
              groundingMetadata.webSearchQueries?.length > 0
            ) {
              for (const query of groundingMetadata.webSearchQueries) {
                webCitations.push({
                  type: "web",
                  url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                  sourceName: query,
                });
              }
            }
          }

          const allCitations = [...citations, ...webCitations];

          // Save assistant message
          await prisma.message.create({
            data: {
              chatId,
              role: "ASSISTANT",
              content: fullResponse,
              citations: JSON.parse(JSON.stringify(allCitations)),
            },
          });

          // Update chat timestamp
          await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() },
          });

          // Send citations and done signal
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ citations: allCitations })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream failed" })}\n\n`
            )
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Message error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { chatId } = await params;

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
    });

    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Delete messages first, then chat
    await prisma.message.deleteMany({ where: { chatId } });
    await prisma.chat.delete({ where: { id: chatId } });

    return NextResponse.json({ message: "Chat deleted" });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}