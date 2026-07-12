import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "driver") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!driver) {
      return NextResponse.json({ trips: [] });
    }

    const trips = await prisma.trip.findMany({
      where: { driverId: driver.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("[Driver Trip History] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
