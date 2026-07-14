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
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const bid = await prisma.bid.findUnique({
      where: { id: paramId },
      include: { trip: true },
    });

    if (!bid) {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
    }

    const userId = (session.user as any).id;
    if (bid.trip.customerId !== userId && bid.driverId !== userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    await prisma.bid.update({
      where: { id: paramId },
      data: { status: "rejected" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Reject Bid] Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
