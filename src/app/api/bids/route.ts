import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { emitBidUpdate } from "@/server/socket";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { tripId, price } = await request.json();

    if (!tripId || !price || typeof price !== "number" || price <= 0) {
      return NextResponse.json({ error: "الرجاء إدخال سعر صحيح" }, { status: 400 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: (session.user as any).id },
      include: { user: true },
    });

    if (!driver) {
      return NextResponse.json({ error: "حساب السائق غير موجود" }, { status: 404 });
    }

    if (driver.subscriptionStatus !== "active") {
      return NextResponse.json({
        error: "الاشتراك غير مفعل. يرجى تفعيل الاشتراك الشهري (150 LYD) للوصول إلى الطلبات.",
      }, { status: 403 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: { customer: { select: { city: true } } },
    });

    if (!trip || trip.status !== "pending") {
      return NextResponse.json({ error: "الرحلة غير متاحة للعروض حالياً" }, { status: 400 });
    }

    if (trip.customerId === driver.userId) {
      return NextResponse.json({ error: "لا يمكنك تقديم عرض على طلبك الخاص" }, { status: 400 });
    }

    if (trip.customer.city !== (driver.user.city || "بني وليد")) {
      return NextResponse.json({ error: "لا يمكنك تقديم عرض على طلب خارج مدينتك" }, { status: 403 });
    }

    const existing = await prisma.bid.findFirst({
      where: { tripId, driverId: driver.id },
    });

    if (existing) {
      return NextResponse.json({ error: "لقد قدمت عرضاً مسبقاً لهذه الرحلة" }, { status: 409 });
    }

    const bid = await prisma.bid.create({
      data: { tripId, driverId: driver.id, price, status: "pending" },
      include: { driver: { include: { user: { select: { name: true } } } } },
    });

    emitBidUpdate(tripId, {
      id: bid.id,
      driverId: driver.id,
      price: bid.price,
      driverName: driver.user.name,
      rating: driver.rating,
      totalTrips: driver.totalTrips,
    });

    return NextResponse.json({ bid }, { status: 201 });
  } catch (error) {
    console.error("[Bid Submit] Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
