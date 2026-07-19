import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");
    if (!tripId) return NextResponse.json({ error: "معرف الرحلة مطلوب" }, { status: 400 });

    const messages = await prisma.message.findMany({
      where: { tripId },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { tripId, text } = await request.json();
    if (!tripId || !text?.trim()) return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });

    const msg = await prisma.message.create({
      data: { tripId, senderId: (session.user as any).id, text: text.trim() },
      include: { sender: { select: { name: true } } },
    });

    return NextResponse.json({ message: msg }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
