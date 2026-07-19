import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { tripId } = await request.json();
    if (!tripId) return NextResponse.json({ error: "معرف الرحلة مطلوب" }, { status: 400 });

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.customerId !== (session.user as any).id) return NextResponse.json({ error: "غير مصرح" }, { status: 404 });
    if (trip.status !== "pending") return NextResponse.json({ error: "لا يمكن إلغاء رحلة نشطة" }, { status: 400 });

    await prisma.trip.update({ where: { id: tripId }, data: { status: "cancelled" } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
