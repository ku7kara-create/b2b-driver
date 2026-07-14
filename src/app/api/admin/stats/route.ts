import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
    if ((session.user as any).role !== "admin") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get("all") === "true";

    const where: any = { role: { not: "admin" } };
    if (!showAll) {
      where.isApproved = false;
    }

    const [usersCount, driversCount, tripsCount, completedTrips, revenue, pendingUsers] = await Promise.all([
      prisma.user.count(),
      prisma.driver.count(),
      prisma.trip.count(),
      prisma.trip.count({ where: { status: "completed" } }),
      prisma.trip.aggregate({ where: { status: "completed" }, _sum: { agreedPrice: true } }),
      prisma.user.findMany({
        where,
        include: { driver: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      stats: {
        users: usersCount,
        drivers: driversCount,
        trips: tripsCount,
        completedTrips,
        revenue: revenue._sum.agreedPrice || 0,
      },
      pendingUsers: pendingUsers.map((u) => ({
        id: u.id,
        name: u.name,
        phone: u.phone || "",
        role: u.role,
        isApproved: u.isApproved,
        createdAt: u.createdAt.toISOString(),
        driver: u.driver ? {
          id: u.driver.id,
          subscriptionStatus: u.driver.subscriptionStatus,
          subscriptionExpiry: u.driver.subscriptionExpiry?.toISOString() || null,
          isAvailable: u.driver.isAvailable,
          rating: u.driver.rating,
          totalTrips: u.driver.totalTrips,
          idNumber: u.driver.idNumber,
          licenseType: u.driver.licenseType,
        } : null,
      })),
    });
  } catch (error) {
    console.error("[Admin Stats] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
