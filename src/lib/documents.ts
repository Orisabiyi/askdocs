import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractText(
  buffer: Buffer,
  fileType: string
): Promise<{ text: string; pageCount: number | null }> {
  switch (fileType) {
    case "application/pdf":
      return extractFromPdf(buffer);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return extractFromDocx(buffer);
    case "text/plain":
    case "text/markdown":
      return { text: buffer.toString("utf-8"), pageCount: null };
    default:
      throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractFromPdf(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const pageCount = result.pages.length;
  const text = result.pages.map((page) => page.text).join("\n");
  await parser.destroy();
  return { text, pageCount };
}

async function extractFromDocx(buffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value, pageCount: null };
}

export function chunkText(
  text: string,
  chunkSize: number = 512,
  overlap: number = 50
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  if (words.length === 0) return chunks;

  let start = 0;
  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(" ");

    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim());
    }

    if (end >= words.length) break;
    start = end - overlap;
  }

  return chunks;
}