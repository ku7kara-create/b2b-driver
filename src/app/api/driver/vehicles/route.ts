import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const driver = await prisma.driver.findUnique({ where: { userId: (session.user as any).id } });
    if (!driver) return NextResponse.json({ type: null });

    const vehicle = await prisma.vehicle.findFirst({ where: { driverId: driver.id } });

    return NextResponse.json({ type: vehicle?.type || null });
  } catch {
    return NextResponse.json({ type: null });
  }
}
