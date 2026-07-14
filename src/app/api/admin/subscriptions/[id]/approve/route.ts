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

    const { driverId } = await request.json();

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
