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

    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        driver: {
          include: { user: { select: { name: true, phone: true } } },
        },
      },
    });

    if (!trip || trip.customerId !== (session.user as any).id) {
      return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ trip });
  } catch (error) {
    console.error("[Trip GET] Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
