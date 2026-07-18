import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: paramId },
    });

    const userId = (session.user as any).id;
    const role = (session.user as any).role;

    if (role !== "customer" && role !== "driver") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    if (!trip) {
      return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    }

    if (role === "customer" && trip.customerId !== userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 404 });
    }

    let where: any = { tripId: paramId };
    if (role === "driver") {
      const driver = await prisma.driver.findUnique({ where: { userId } });
      where.driverId = driver?.id || "";
    } else {
      where.status = "pending";
    }

    const bids = await prisma.bid.findMany({
      where,
      include: {
        driver: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
      orderBy: { price: "asc" },
    });

    return NextResponse.json({ bids });
  } catch (error) {
    console.error("[Bids GET] Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
