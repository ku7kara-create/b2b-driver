import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { bidId } = await request.json();
    if (!bidId) {
      return NextResponse.json({ error: "معرف العرض مطلوب" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({ where: { id: params.id } });
    if (!trip || trip.customerId !== (session.user as any).id) {
      return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    }

    if (trip.status !== "pending") {
      return NextResponse.json({ error: "تم قبول عرض مسبقاً" }, { status: 400 });
    }

    const bid = await prisma.bid.findUnique({ where: { id: bidId } });
    if (!bid || bid.tripId !== params.id) {
      return NextResponse.json({ error: "العرض غير موجود" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.bid.update({ where: { id: bidId }, data: { status: "accepted" } }),
      prisma.bid.updateMany({ where: { tripId: params.id, id: { not: bidId } }, data: { status: "rejected" } }),
      prisma.trip.update({
        where: { id: params.id },
        data: { status: "accepted", driverId: bid.driverId, agreedPrice: bid.price, acceptedBidId: bidId },
      }),
    ]);

    return NextResponse.json({ tripId: params.id, driverId: bid.driverId, success: true });
  } catch (error) {
    console.error("[Accept Bid] Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
