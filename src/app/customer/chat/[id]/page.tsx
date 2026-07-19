"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";

interface Message { id: string; text: string; sender: { name: string }; senderId: string; createdAt: string; }

export default function CustomerChatPage() {
  const params = useParams(); const tripId = params?.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
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
        if (msgRes.ok) setMessages((await msgRes.json()).messages || []);
        if (sessRes.ok) setMyId(((await sessRes.json()) as any)?.user?.id || "");
      } catch {}
      setLoading(false);
    })();
    const iv = setInterval(async () => {
      try { const r = await fetch(`/api/messages?tripId=${tripId}`); if (r.ok) setMessages((await r.json()).messages || []); } catch {}
    }, 3000);
    return () => clearInterval(iv);
  }, [tripId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!text.trim()) return;
    const t = text; setText("");
    try { await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tripId, text: t }) }); } catch {}
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 flex flex-row-reverse items-center px-4 h-16">
        <Link href={`/customer/trip/${tripId}`} className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">arrow_forward</span></Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">المحادثة</h1>
      </header>
      <main className="flex-1 p-4 max-w-lg mx-auto w-full overflow-y-auto space-y-3">
        {loading ? <p className="text-center text-gray-400">جاري التحميل...</p> :
          messages.map((m) => (
            <div key={m.id} className={`flex ${m.senderId === myId ? "justify-end" : "justify-start"}`}>
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
