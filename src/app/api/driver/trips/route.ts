import { NextRequest, NextResponse } from "next/server";
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
      include: { user: true },
    });

    if (!driver) {
      return NextResponse.json({ error: "حساب السائق غير موجود" }, { status: 404 });
    }

    if (driver.subscriptionStatus !== "active") {
      return NextResponse.json({ error: "الاشتراك غير مفعل" }, { status: 403 });
    }

    const driverCity = driver.user.city || "بني وليد";

    const driverVehicle = await prisma.vehicle.findFirst({ where: { driverId: driver.id } });
    const vehicleType = driverVehicle?.type || "private_car";

    let serviceTypes: string[] = [vehicleType];
    if (vehicleType === "porter_canter") {
      serviceTypes = ["porter", "porter_canter"];
    }

    const trips = await prisma.trip.findMany({
      where: {
        status: "pending",
        driverId: null,
        customer: { city: driverCity },
        serviceType: { in: serviceTypes },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("[Driver Trips] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
