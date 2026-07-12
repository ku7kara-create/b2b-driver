import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { online } = await request.json();

    await prisma.driver.update({
      where: { userId: (session.user as any).id },
      data: { isAvailable: online },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Driver Online] Error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
