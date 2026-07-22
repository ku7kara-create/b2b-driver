import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/server/socket";
import { sendChatNotification } from "@/lib/fcm";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");
    if (!tripId) return NextResponse.json({ error: "معرف الرحلة مطلوب" }, { status: 400 });

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { customerId: true, driverId: true, driver: { select: { userId: true } } },
    });
    if (!trip) return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    const uid = (session.user as any).id;
    if (trip.customerId !== uid && trip.driver?.userId !== uid) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { tripId },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json({ messages });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { tripId, text } = await request.json();
    if (!tripId || !text?.trim()) return NextResponse.json({ error: "بيانات غير مكتملة" }, { status: 400 });

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { customerId: true, driverId: true, driver: { select: { userId: true } } },
    });
    if (!trip) return NextResponse.json({ error: "الرحلة غير موجودة" }, { status: 404 });
    const uid = (session.user as any).id;
    if (trip.customerId !== uid && trip.driver?.userId !== uid) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
    }

    const msg = await prisma.message.create({
      data: { tripId, senderId: uid, text: text.trim() },
      include: { sender: { select: { name: true } } },
    });

    const senderName = msg.sender.name || (session.user as any).name || "";
    const recipientId = uid === trip.customerId ? trip.driver?.userId : trip.customerId;
    if (recipientId) {
      try {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: "chat",
            title: "رسالة جديدة",
            body: msg.text,
            data: JSON.stringify({ tripId, messageId: msg.id }),
          },
        });
      } catch {}
      sendChatNotification(tripId, senderName, msg.text, recipientId);
    }

    const io = getIO();
    if (io) {
      io.to(`trip:${tripId}`).emit("chat:message", {
        id: msg.id,
        tripId,
        senderId: uid,
        senderName: msg.sender.name,
        text: msg.text,
        createdAt: msg.createdAt,
      });
    }

    return NextResponse.json({ message: msg }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
