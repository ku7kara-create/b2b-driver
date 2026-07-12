"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";

interface Bid {
  id: string;
  tripId: string;
  driverId: string;
  price: number;
  status: string;
  createdAt: string;
  driver?: {
    id: string;
    user: { name: string; phone: string };
    rating: number;
    totalTrips: number;
  } | null;
  driverName?: string;
  rating?: number;
  totalTrips?: number;
}

export default function CustomerBidsPage() {
  const params = useParams();
  const router = useRouter();
  const { socket } = useSocket();
  const { toast } = useToast();
  const tripId = params?.id as string;
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  async function fetchBids() {
    try {
      const res = await fetch(`/api/trips/${tripId}/bids`);
      if (res.ok) {
        const data = await res.json();
        setBids(data.bids || []);
      }
    } catch {}
    setLoading(false);
  }

  useEffect(() => {
    fetchBids();
    pollRef.current = setInterval(fetchBids, 10000);

    if (socket) {
      socket.emit("trip:join", tripId);
      socket.on("bid:update", (bid: Bid) => {
        setBids((prev) => {
          const exists = prev.find((b) => b.id === bid.id);
          if (exists) return prev;
          toast(`عرض جديد: ${bid.price?.toFixed(2)} LYD من ${bid.driverName || "سائق"}`, "info");
          return [
            ...prev,
            {
              ...bid,
              status: bid.status || "pending",
              tripId: tripId,
              createdAt: new Date().toISOString(),
              driver: bid.driver || { user: { name: bid.driverName || "سائق", phone: "" }, rating: bid.rating || 0, totalTrips: bid.totalTrips || 0, id: bid.driverId },
            },
          ];
        });
      });

      socket.on("bid:accepted", (data: { tripId: string }) => {
        if (data.tripId === tripId) {
          toast("تم قبول العرض! جاري التحويل للتتبع", "success");
          router.push(`/customer/trip/${tripId}`);
        }
      });
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (socket) {
        socket.off("bid:update");
        socket.off("bid:accepted");
        socket.emit("trip:leave", tripId);
      }
    };
  }, [tripId, socket]);

  async function handleAccept(bidId: string) {
    setAcceptingId(bidId);
    try {
      const res = await fetch(`/api/trips/${tripId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("تم قبول العرض بنجاح", "success");
        if (socket) socket.emit("bid:accepted", { tripId, driverId: data.driverId });
        router.push(`/customer/trip/${tripId}`);
      } else {
        toast(data.error || "فشل قبول العرض", "error");
      }
    } catch {
      toast("تعذر الاتصال بالخادم", "error");
    }
    setAcceptingId(null);
  }

  async function handleReject(bidId: string) {
    try {
      await fetch(`/api/bids/${bidId}/reject`, { method: "POST" });
      setBids((prev) => prev.filter((b) => b.id !== bidId));
      toast("تم رفض العرض", "info");
    } catch {}
  }

  const avgPrice = bids.length > 0 ? bids.reduce((s, b) => s + b.price, 0) / bids.length : 0;
  const minPrice = bids.length > 0 ? Math.min(...bids.map((b) => b.price)) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <header className="sticky top-0 z-40 bg-surface border-b border-outline-variant flex flex-row-reverse justify-between items-center w-full px-4 h-16">
        <div className="flex items-center gap-4">
          <Link href="/customer/dashboard" className="p-2 hover:bg-surface-container-low rounded-full">
            <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
          </Link>
          <h1 className="text-xl font-semibold text-on-surface">العروض والمزايدات</h1>
        </div>
        <button onClick={fetchBids} className="bg-surface-container-low p-2 rounded-full">
          <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
        </button>
      </header>

      <main className="flex-grow p-4 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "إجمالي العروض", value: bids.length, icon: "gavel", bg: "bg-secondary-fixed", text: "text-secondary" },
            { label: "أقل سعر", value: bids.length > 0 ? `${minPrice.toFixed(2)} LYD` : "—", icon: "payments", bg: "bg-surface-container-high", text: "text-blue-500" },
            { label: "متوسط السعر", value: bids.length > 0 ? `${avgPrice.toFixed(2)} LYD` : "—", icon: "timer", bg: "bg-primary-fixed", text: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border-r-4 border-r-secondary flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant mb-1">{s.label}</p>
                <p className="text-2xl font-bold text-on-surface">{s.value}</p>
              </div>
              <div className={`${s.bg} p-3 rounded-lg`}>
                <span className={`material-symbols-outlined ${s.text}`}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center mb-4">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">جاري تحميل العروض...</div>
        ) : bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-surface-container p-8 rounded-full mb-6">
              <span className="material-symbols-outlined text-6xl text-outline">move_to_inbox</span>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">لا توجد عروض حالياً</h2>
            <p className="text-base text-on-surface-variant max-w-sm">
              سيظهر السائقون المهتمون بشحنتك هنا فور تقديم عروضهم. انتظر قليلاً...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bids
              .sort((a, b) => a.price - b.price)
              .map((bid) => (
                <div key={bid.id} className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm">
                  <div className="flex items-start gap-4 flex-col md:flex-row">
                    <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">person</span>
                    </div>
                    <div className="flex-grow w-full">
                      <div className="flex flex-wrap justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-on-surface">
                            {bid.driver?.user?.name || bid.driverName || "سائق"}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex items-center text-yellow-500">
                              <span className="material-symbols-outlined text-sm">star</span>
                              <span className="text-sm font-bold mr-1">
                                {(bid.driver?.rating || bid.rating || 0).toFixed(1)}
                              </span>
                            </div>
                            <span className="text-outline text-xs">|</span>
                            <span className="text-sm text-on-surface-variant">
                              {bid.driver?.totalTrips || bid.totalTrips || 0} رحلة
                            </span>
                          </div>
                        </div>
                        <div className="text-left mt-2 md:mt-0">
                          <p className="text-2xl font-bold text-primary">
                            {bid.price.toFixed(2)} <span className="text-sm font-normal">LYD</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 border-t border-outline-variant pt-4 mt-4">
                        <button
                          onClick={() => handleAccept(bid.id)}
                          disabled={acceptingId === bid.id}
                          className="flex-grow bg-secondary-container text-white font-bold py-2.5 px-6 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                          {acceptingId === bid.id ? (
                            <>
                              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                              جاري القبول...
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined">check_circle</span>
                              قبول العرض
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(bid.id)}
                          className="px-6 py-2.5 rounded-lg border-2 border-outline text-on-surface-variant font-bold hover:bg-surface-container-low active:scale-95 transition-all"
                        >
                          رفض
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>
    </div>
  );
}
