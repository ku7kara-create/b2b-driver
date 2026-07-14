import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

async function createNotification(userId: string, type: string, title: string, body: string, data?: string) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, data: data || null },
    });
  } catch {}
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: paramId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { status } = await request.json();
    const allowed = ["started", "completed"];
    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({ where: { id: paramId } });
    if (!trip) {
      return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    }

    const driver = await prisma.driver.findUnique({
      where: { userId: (session.user as any).id },
    });

    if (!driver || trip.driverId !== driver.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const updates: Record<string, unknown> = { status };
    if (status === "started") updates.startedAt = new Date();
    if (status === "completed") updates.completedAt = new Date();

    await prisma.trip.update({
      where: { id: paramId },
      data: updates,
    });

    if (status === "started") {
      await createNotification(
        trip.customerId,
        "trip_started",
        "بدأت الرحلة",
        "السائق في طريقه إليك",
        JSON.stringify({ tripId: paramId }),
      );
    }

    if (status === "completed") {
      await prisma.driver.update({
        where: { id: driver.id },
        data: { totalTrips: { increment: 1 } },
      });

      await createNotification(
        trip.customerId,
        "trip_completed",
        "اكتملت الرحلة",
        "تم إتمام الرحلة بنجاح. يرجى تقييم السائق.",
        JSON.stringify({ tripId: paramId }),
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Trip Status] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
