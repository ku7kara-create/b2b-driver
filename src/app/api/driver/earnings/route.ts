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
      return NextResponse.json({ today: 0, trips: 0, hours: 0 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayTrips = await prisma.trip.findMany({
      where: {
        driverId: driver.id,
        status: "completed",
        completedAt: { gte: today },
      },
    });

    const todayEarnings = todayTrips.reduce((sum, t) => sum + (t.agreedPrice || 0), 0);
    const allTrips = await prisma.trip.count({
      where: { driverId: driver.id, status: "completed" },
    });

    return NextResponse.json({
      today: todayEarnings,
      trips: todayTrips.length,
      hours: todayTrips.length > 0 ? Math.round((todayTrips.length * 0.7) * 10) / 10 : 0,
      total: allTrips,
    });
  } catch (error) {
    console.error("[Driver Earnings] Error:", error);
    return NextResponse.json({ today: 0, trips: 0, hours: 0 });
  }
}
