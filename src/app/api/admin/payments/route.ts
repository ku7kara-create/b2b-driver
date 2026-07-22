import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    if ((session.user as any).role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const adminUser = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { assignedCity: true },
    });
    const adminCity = adminUser?.assignedCity || "بني وليد";

    const payments = await prisma.subscription.findMany({
      where: { driver: { user: { city: adminCity } } },
      include: { driver: { include: { user: { select: { name: true, phone: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error("[Admin Payments] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
