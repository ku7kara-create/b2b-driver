import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      phone,
      password,
      role,
      city,
      gender,
      licenseType,
      vehicleType,
    } = body;

    if (!name || !phone || !password || !role) {
      return NextResponse.json(
        { error: "جميع الحقول المطلوبة غير مكتملة" },
        { status: 400 },
      );
    }

    if (!["customer", "driver"].includes(role)) {
      return NextResponse.json(
        { error: "نوع الحساب غير صالح" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({
      where: { phone },
    });

    if (existing) {
      return NextResponse.json(
        { error: "رقم الهاتف مسجل مسبقاً" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        role,
        city: city || "بني وليد",
        gender: gender || null,
      },
    });

    if (role === "driver") {
      const driver = await prisma.driver.create({
        data: {
          userId: user.id,
          subscriptionStatus: "inactive",
          isAvailable: false,
          rating: 0,
          totalTrips: 0,
          licenseType: licenseType || null,
        },
      });

      if (vehicleType) {
        await prisma.vehicle.create({
          data: {
            driverId: driver.id,
            type: vehicleType,
          },
        });
      }
    }

    return NextResponse.json(
      { success: true, userId: user.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("[Register] Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في الخادم. حاول مرة أخرى." },
      { status: 500 },
    );
  }
}
