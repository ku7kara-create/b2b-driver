import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { broadcastNewTrip } from "@/server/socket";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const body = await request.json();
    const { serviceType, pickupAddress, pickupLat, pickupLng, dropoffAddress, dropoffLat, dropoffLng, cargoDetails, cargoPhotos, vehicleMakeModel } = body;

    if (!serviceType || !pickupAddress || !dropoffAddress) {
      return NextResponse.json({ error: "جميع الحقول المطلوبة غير مكتملة" }, { status: 400 });
    }

    const validTypes = ["car", "porter", "tow_truck"];
    if (!validTypes.includes(serviceType)) {
      return NextResponse.json({ error: "نوع الخدمة غير صالح" }, { status: 400 });
    }

    if (serviceType === "porter" && !cargoDetails) {
      return NextResponse.json({ error: "تفاصيل البضائع مطلوبة لخدمة البورتر" }, { status: 400 });
    }

    if (serviceType === "tow_truck" && !vehicleMakeModel) {
      return NextResponse.json({ error: "نوع المركبة مطلوب لخدمة الساحبة" }, { status: 400 });
    }

    const trip = await prisma.trip.create({
      data: {
        customerId: (session.user as any).id,
        serviceType,
        pickupAddress,
        pickupLat: pickupLat || 24.7136,
        pickupLng: pickupLng || 46.6753,
        dropoffAddress,
        dropoffLat: dropoffLat || 24.7742,
        dropoffLng: dropoffLng || 46.7385,
        cargoDetails: cargoDetails || null,
        cargoPhotos: cargoPhotos || null,
        vehicleMakeModel: vehicleMakeModel || null,
        status: "pending",
      },
    });

    broadcastNewTrip(trip.id, serviceType, pickupAddress);

    return NextResponse.json({ tripId: trip.id }, { status: 201 });
  } catch (error) {
    console.error("[Trips POST] Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    if (status === "active") {
      const activeTrip = await prisma.trip.findFirst({
        where: {
          customerId: (session.user as any).id,
          status: { in: ["pending", "accepted", "started"] },
        },
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json({ activeTrip });
    }

    const trips = await prisma.trip.findMany({
      where: { customerId: (session.user as any).id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("[Trips GET] Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
