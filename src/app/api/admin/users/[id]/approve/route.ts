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

    const admin = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { assignedCity: true },
    });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }
    if (user.city !== (admin?.assignedCity || "بني وليد")) {
      return NextResponse.json({ error: "لا يمكن الموافقة على مستخدم من مدينة أخرى" }, { status: 403 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isApproved: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Approve] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
