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

    if (!trip || trip.customerId !== (session.user as any).id) {
      return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    }

    const bids = await prisma.bid.findMany({
      where: { tripId: paramId, status: "pending" },
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
