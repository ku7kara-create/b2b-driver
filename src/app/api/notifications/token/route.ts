import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { token, platform } = await request.json();
    if (!token) return NextResponse.json({ error: "التوكن مطلوب" }, { status: 400 });

    const userId = (session.user as any).id;

    const existing = await prisma.pushToken.findUnique({ where: { token } });
    if (existing) {
      if (existing.userId !== userId) {
        await prisma.pushToken.update({ where: { id: existing.id }, data: { userId } });
      }
    } else {
      await prisma.pushToken.create({ data: { userId, token, platform: platform || "web" } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PushToken] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { token } = await request.json();
    if (!token) return NextResponse.json({ error: "التوكن مطلوب" }, { status: 400 });

    await prisma.pushToken.deleteMany({ where: { token } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PushToken] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
