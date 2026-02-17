import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - list user's chats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const chats = await prisma.chat.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error("Fetch chats error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

// POST - create a new chat
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();

    const chat = await prisma.chat.create({
      data: {
        title: title || "New Chat",
        userId: session.user.id,
      },
    });

    return NextResponse.json(chat, { status: 201 });
  } catch (error) {
    console.error("Create chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}