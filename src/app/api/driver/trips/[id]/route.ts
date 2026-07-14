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
    if (!session?.user || (session.user as any).role !== "driver") {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: (session.user as any).id },
    });

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        customer: { select: { name: true, phone: true } },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    }

    if (trip.driverId && trip.driverId !== driver?.id) {
      return NextResponse.json({
        trip: {
          ...trip,
          customer: null,
        },
      });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error("[Driver Trip GET] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
