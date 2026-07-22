"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/header";
import { io } from "socket.io-client";

interface ChatMessage { id: string; tripId: string; senderId: string; senderName: string; text: string; createdAt: string; }

export default function DriverChatPage() {
  const params = useParams(); const tripId = params?.id as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [myId, setMyId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const [msgRes, sessRes] = await Promise.all([
          fetch(`/api/messages?tripId=${tripId}`),
          fetch("/api/auth/session"),
        ]);
        if (msgRes.ok) {
          const raw = (await msgRes.json()).messages || [];
          setMessages(raw.map((m: any) => ({ id: m.id, tripId, senderId: m.senderId, senderName: m.sender?.name || "", text: m.text, createdAt: m.createdAt })));
        }
        if (sessRes.ok) setMyId(((await sessRes.json()) as any)?.user?.id || "");
      } catch {}
      setLoading(false);
    })();
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5002";
    const s = io(socketUrl, { transports: ["websocket", "polling"], forceNew: true });
    s.emit("trip:join", tripId);
    s.on("chat:message", (m: ChatMessage) => {
      setMessages((prev) => { if (prev.some((p) => p.id === m.id)) return prev; return [...prev, m]; });
    });
    const iv = setInterval(async () => {
      try { const r = await fetch(`/api/messages?tripId=${tripId}`); if (r.ok) { const raw = (await r.json()).messages || []; setMessages(raw.map((m: any) => ({ id: m.id, tripId, senderId: m.senderId, senderName: m.sender?.name || "", text: m.text, createdAt: m.createdAt }))); } } catch {}
    }, 3000);
    return () => { clearInterval(iv); s.disconnect(); };
  }, [tripId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!text.trim()) return;
    const t = text; setText("");
    try {
      const r = await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tripId, text: t }) });
      if (r.ok) {
        const data = await r.json();
        if (data?.message) {
          setMessages((prev) => {
            if (prev.some((p) => p.id === data.message.id)) return prev;
            return [...prev, { id: data.message.id, tripId, senderId: data.message.senderId, senderName: data.message.sender?.name || "", text: data.message.text, createdAt: data.message.createdAt }];
          });
        }
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <Header title="المحادثة" backHref={`/driver/trip/${tripId}`} />
      <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-y-auto space-y-3">
        {loading ? <p className="text-center text-gray-400">جاري التحميل...</p> :
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderId === myId ? "justify-start" : "justify-end"}`}>
              <div style={{
                maxWidth: "75%",
                padding: "8px 16px",
                borderRadius: "12px",
                backgroundColor: m.senderId === myId ? "#FF8C00" : "#F0F2F5",
                color: m.senderId === myId ? "#ffffff" : "#1a1a1a",
              }}>
                <p className="text-sm">{m.text}</p>
              </div>
            </div>
          ))}
        <div ref={bottomRef} />
      </main>
      <div className="bg-white border-t border-gray-200 p-3 flex gap-2">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="اكتب رسالة..." className="flex-1 h-12 px-4 border border-[#E0E0E0] rounded-lg focus:border-[#FF8C00] focus:ring-1 focus:ring-[#FF8C00] bg-white" />
        <button onClick={send} style={{ backgroundColor: "#FF8C00", color: "white", padding: "0 24px", borderRadius: "8px", fontWeight: "bold", border: "none", cursor: "pointer", fontSize: "16px" }}><span className="material-symbols-outlined">send</span></button>
      </div>
    </div>
  );
}
