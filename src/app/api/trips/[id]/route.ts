import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        customer: { select: { name: true, phone: true } },
        driver: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    }

    const isOwner = trip.customerId === userId;
    const driver = await prisma.driver.findUnique({ where: { userId } });
    const isDriver = driver && trip.driverId === driver.id;

    if (!isOwner && !isDriver) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error("[Trip GET] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
