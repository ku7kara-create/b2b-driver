import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const [usersCount, driversCount, tripsCount, pendingSubs, completedTrips, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.driver.count(),
      prisma.trip.count(),
      prisma.subscription.findMany({ where: { status: "pending" }, include: { driver: { include: { user: { select: { name: true, phone: true } } } } } }),
      prisma.trip.count({ where: { status: "completed" } }),
      prisma.trip.aggregate({ where: { status: "completed" }, _sum: { agreedPrice: true } }),
    ]);

    return NextResponse.json({
      stats: {
        users: usersCount,
        drivers: driversCount,
        trips: tripsCount,
        completedTrips,
        revenue: revenue._sum.agreedPrice || 0,
      },
      pendingSubscriptions: pendingSubs,
    });
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
