import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { action } = await request.json();

    if (action === "block") {
      await prisma.user.update({ where: { id: userId }, data: { isApproved: false } });
    } else if (action === "unblock") {
      await prisma.user.update({ where: { id: userId }, data: { isApproved: true } });
    } else {
      return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin User Toggle] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
