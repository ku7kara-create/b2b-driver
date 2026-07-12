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

    const { status } = await request.json();

    const allowedStatuses = ["started", "completed"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({ where: { id: params.id } });

    if (!trip) {
      return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!driver || trip.driverId !== driver.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const updateData: any = { status };
    if (status === "started") updateData.startedAt = new Date();
    if (status === "completed") updateData.completedAt = new Date();

    await prisma.trip.update({
      where: { id: params.id },
      data: updateData,
    });

    if (status === "completed") {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { totalTrips: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Trip Status] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
