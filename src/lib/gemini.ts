import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GOOGLE_AI_API_KEY) {
  throw new Error("GOOGLE_AI_API_KEY is not set");
}

export const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

export const embeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

export async function generateEmbedding(text: string): Promise<number[]> {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const results = await Promise.all(texts.map((text) => generateEmbedding(text)));
  return results;
}