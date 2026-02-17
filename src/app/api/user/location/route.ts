import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET - auto-detect location from IP
export async function GET() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    return NextResponse.json({
      country: data.country_name || null,
      state: data.region || null,
      timezone: data.timezone || null,
    });
  } catch {
    return NextResponse.json(
      { country: null, state: null, timezone: null },
      { status: 200 }
    );
  }
}

// POST - save user's location
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { country, state, timezone } = await req.json();

    if (!country) {
      return NextResponse.json(
        { error: "Country is required" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { country, state, timezone },
    });

    return NextResponse.json({ message: "Location saved" });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}