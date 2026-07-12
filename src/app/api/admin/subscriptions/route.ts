import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { driverId, userId, amount } = await request.json();

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await prisma.$transaction([
      prisma.subscription.create({
        data: {
          driverId,
          amount: amount || 150,
          currency: "LYD",
          status: "paid",
          paidAt: new Date(),
          expiresAt: expiryDate,
        },
      }),
      prisma.driver.update({
        where: { id: driverId },
        data: { subscriptionStatus: "active", subscriptionExpiry: expiryDate, isAvailable: true },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { role: "driver" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Admin Sub Create] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
