import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { assignedCity: true },
    });

    const { driverId } = await request.json();

    const driverRecord = await prisma.driver.findUnique({
      where: { id: driverId },
      include: { user: { select: { city: true } } },
    });
    if (!driverRecord) return NextResponse.json({ error: "السائق غير موجود" }, { status: 404 });
    if (driverRecord.user.city !== (admin?.assignedCity || "بني وليد")) {
      return NextResponse.json({ error: "لا يمكن الموافقة على اشتراك لسائق من مدينة أخرى" }, { status: 403 });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: paramId },
        data: { status: "paid", paidAt: new Date(), expiresAt: expiryDate },
      }),
      prisma.driver.update({
        where: { id: driverId },
        data: {
          subscriptionStatus: "active",
          subscriptionExpiry: expiryDate,
          isAvailable: true,
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Approve Sub] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
