import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: driverId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { assignedCity: true },
    });
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: { select: { city: true } } },
    });
    if (!driver) return NextResponse.json({ error: "السائق غير موجود" }, { status: 404 });
    if (driver.user.city !== (admin?.assignedCity || "بني وليد")) {
      return NextResponse.json({ error: "لا يمكن تعديل سائق من مدينة أخرى" }, { status: 403 });
    }

    const { action } = await request.json();

    if (action === "activate") {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      await prisma.driver.update({
        where: { id: driverId },
        data: {
          subscriptionStatus: "active",
          subscriptionExpiry: expiryDate,
          isAvailable: true,
        },
      });

      return NextResponse.json({ success: true, expiresAt: expiryDate.toISOString() });
    }

    if (action === "deactivate") {
      await prisma.driver.update({
        where: { id: driverId },
        data: {
          subscriptionStatus: "inactive",
          isAvailable: false,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  } catch (error) {
    console.error("[Admin Driver Toggle] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
