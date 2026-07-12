import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { tripId, rating, comment } = await request.json();

    if (!tripId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { driver: true },
    });

    if (!trip) {
      return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    }

    if (trip.status !== "completed") {
      return NextResponse.json({ error: "لا يمكن التقييم قبل اكتمال الرحلة" }, { status: 400 });
    }

    const userId = (session.user as any).id;
    const isCustomer = trip.customerId === userId;
    const isDriver = trip.driverId === trip.driver?.id;

    if (!isCustomer && !isDriver) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const existingReview = await prisma.review.findFirst({
      where: { tripId, reviewerId: userId },
    });

    if (existingReview) {
      return NextResponse.json({ error: "لقد قمت بالتقييم مسبقاً" }, { status: 409 });
    }

    const revieweeId = isCustomer ? trip.driver?.userId : trip.customerId;
    if (!revieweeId) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        tripId,
        reviewerId: userId,
        revieweeId,
        rating,
        comment: comment || null,
      },
    });

    if (isCustomer && trip.driverId) {
      const avgRating = await prisma.review.aggregate({
        where: { revieweeId },
        _avg: { rating: true },
      });

      await prisma.driver.update({
        where: { id: trip.driverId },
        data: { rating: avgRating._avg.rating || rating },
      });
    }

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("[Review] Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
