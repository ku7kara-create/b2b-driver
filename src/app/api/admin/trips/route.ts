import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    if ((session.user as any).role !== "admin") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    const adminUser = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    const adminCity = adminUser?.assignedCity || "بني وليد";

    const trips = await prisma.trip.findMany({
      where: { customer: { city: adminCity } },
      include: {
        customer: { select: { name: true, phone: true } },
        driver: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("[Admin Trips] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
