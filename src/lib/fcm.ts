import { getMessaging } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";

export async function sendChatNotification(tripId: string, senderName: string, text: string, recipientUserId: string) {
  try {
    const tokens = await prisma.pushToken.findMany({
      where: { userId: recipientUserId },
      select: { token: true },
    });
    if (tokens.length === 0) return;

    const messaging = getMessaging();
    if (!messaging) return;

    const payload = {
      tokens: tokens.map((t) => t.token),
      notification: { title: senderName, body: text },
      data: { tripId, type: "chat" },
    };

    const response = await messaging.sendEachForMulticast(payload);
    const invalidTokens: string[] = [];
    response.responses.forEach((r, i) => {
      if (r.error?.code === "messaging/invalid-registration-token" || r.error?.code === "messaging/registration-token-not-registered") {
        invalidTokens.push(tokens[i]?.token || "");
      }
    });
    if (invalidTokens.length > 0) {
      await prisma.pushToken.deleteMany({ where: { token: { in: invalidTokens } } });
    }
  } catch {}
}
