import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { pineconeIndex } from "@/lib/pinecone";
import prisma from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { documentId } = await params;

    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete vectors from Pinecone
    if (document.pineconeIds && document.pineconeIds.length > 0) {
      await pineconeIndex.deleteMany(document.pineconeIds);
    }

    // Delete chunks and document from database
    await prisma.chunk.deleteMany({ where: { documentId } });
    await prisma.document.delete({ where: { id: documentId } });

    return NextResponse.json({ message: "Document deleted" });
  } catch (error) {
    console.error("Delete document error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}