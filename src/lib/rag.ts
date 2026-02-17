import { generateEmbedding } from "@/lib/gemini";
import { pineconeIndex } from "@/lib/pinecone";
import prisma from "@/lib/prisma";

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentName: string;
  content: string;
  score: number;
  chunkIndex: number;
}

export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  topK: number = 6,
  minScore: number = 0.7
): Promise<RetrievedChunk[]> {
  // 1. Embed the query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Get user's document IDs for filtering
  const userDocuments = await prisma.document.findMany({
    where: { userId, status: "READY" },
    select: { id: true, name: true },
  });

  if (userDocuments.length === 0) return [];

  const docMap = new Map(userDocuments.map((d) => [d.id, d.name]));

  // 3. Query Pinecone
  const results = await pineconeIndex.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: {
      documentId: { $in: Array.from(docMap.keys()) },
    },
  });

  // 4. Filter by minimum score and enrich with document names
  const chunks: RetrievedChunk[] = [];

  for (const match of results.matches || []) {
    if (!match.score || match.score < minScore) continue;

    const metadata = match.metadata as Record<string, string | number>;
    const documentId = metadata.documentId as string;
    const documentName = docMap.get(documentId);

    if (!documentName) continue;

    chunks.push({
      chunkId: match.id,
      documentId,
      documentName,
      content: metadata.text as string,
      score: match.score,
      chunkIndex: metadata.chunkIndex as number,
    });
  }

  return chunks;
}

export function buildRAGPrompt(
  query: string,
  chunks: RetrievedChunk[],
  userLocation: { country: string | null; state: string | null }
): string {
  const locationContext =
    userLocation.country
      ? `\nUser location: ${userLocation.state ? `${userLocation.state}, ` : ""}${userLocation.country}`
      : "";

  if (chunks.length === 0) {
    return `You are AskDocs, a document Q&A assistant.${locationContext}

The user asked: "${query}"

No relevant information was found in the user's uploaded documents. Let the user know politely that their documents don't seem to contain information related to their question. Suggest they upload relevant documents or rephrase their question.`;
  }

  const sourcesBlock = chunks
    .map(
      (chunk, i) =>
        `[Source ${i + 1}: ${chunk.documentName}, chunk ${chunk.chunkIndex}]\n${chunk.content}`
    )
    .join("\n\n");

  return `You are AskDocs, a document Q&A assistant. You have access to the user's uploaded documents (provided as numbered sources below) and Google Search for current information.${locationContext}

RULES:
1. Answer the user's question primarily from the provided document sources.
2. When the question touches on legal, regulatory, financial, or compliance matters — use Google Search to find current laws and regulations applicable to the user's location.
3. Clearly distinguish between what the DOCUMENT says and what CURRENT LAW/REGULATION says.
4. Cite every claim from documents using the format [Source N] where N matches the source number.
5. Format web references as [Web: source name].
6. If document content conflicts with current regulations, flag it explicitly.
7. If the sources don't contain enough information to fully answer, say so honestly.
8. Always include a brief disclaimer when providing legal or financial context: "This is informational only, not legal/financial advice."
9. Keep answers clear and concise. Use short paragraphs.

DOCUMENT SOURCES:
${sourcesBlock}

USER QUESTION: ${query}`;
}