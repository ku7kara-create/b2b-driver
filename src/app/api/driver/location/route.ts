import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { tripId, lat, lng } = await request.json();
    if (!tripId || !lat || !lng) return NextResponse.json({ error: "بيانات غير كاملة" }, { status: 400 });

    const driver = await prisma.driver.findUnique({ where: { userId: (session.user as any).id } });
    if (!driver) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });

    await prisma.driver.update({
      where: { id: driver.id },
      data: { currentLat: lat, currentLng: lng },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
