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

    if (!driver || driver.subscriptionStatus !== "active") {
      return NextResponse.json({ error: "الاشتراك غير مفعل" }, { status: 403 });
    }

    const trips = await prisma.trip.findMany({
      where: {
        status: "pending",
        driverId: null,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("[Driver Trips] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
