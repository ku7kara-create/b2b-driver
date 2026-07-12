import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!driver) {
      return NextResponse.json({ error: "حساب السائق غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      subscriptionStatus: driver.subscriptionStatus,
      subscriptionExpiry: driver.subscriptionExpiry?.toISOString() || null,
    });
  } catch (error) {
    console.error("[Driver Sub GET] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!driver) {
      return NextResponse.json({ error: "حساب السائق غير موجود" }, { status: 404 });
    }

    if (driver.subscriptionStatus === "active") {
      return NextResponse.json({ error: "الاشتراك نشط بالفعل" }, { status: 400 });
    }

    await prisma.driver.update({
      where: { userId: (session.user as any).id },
      data: { subscriptionStatus: "pending" },
    });

    await prisma.subscription.create({
      data: {
        driverId: driver.id,
        amount: 150,
        currency: "LYD",
        status: "pending",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Driver Sub POST] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
