import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const driver = await prisma.driver.findUnique({ where: { userId: (session.user as any).id } });
    if (!driver) return NextResponse.json({ today: 0, trips: 0, total: 0, totalEarnings: 0 });

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "today";

    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (filter === "week") {
      startDate.setDate(startDate.getDate() - startDate.getDay());
    } else if (filter === "month") {
      startDate.setDate(1);
    } else if (filter === "all") {
      startDate = new Date(2020, 0, 1);
    }

    const completedTrips = await prisma.trip.findMany({
      where: {
        driverId: driver.id,
        status: "completed",
        completedAt: { gte: startDate },
      },
    });

    const periodEarnings = completedTrips.reduce((sum, t) => sum + (t.agreedPrice || 0), 0);

    const allTrips = await prisma.trip.findMany({
      where: { driverId: driver.id, status: "completed" },
    });

    const totalEarnings = allTrips.reduce((sum, t) => sum + (t.agreedPrice || 0), 0);

    return NextResponse.json({
      today: periodEarnings,
      trips: completedTrips.length,
      total: allTrips.length,
      totalEarnings,
    });
  } catch {
    return NextResponse.json({ today: 0, trips: 0, total: 0, totalEarnings: 0 });
  }
}
