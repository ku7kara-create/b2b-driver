"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/header";

interface Bid {
  id: string; driverId: string; price: number; status: string;
  driver?: { id?: string; user?: { name: string; phone: string }; rating: number; totalTrips: number } | null;
}

export default function CustomerBidsPage() {
  const params = useParams(); const router = useRouter();
  const tripId = (params as any)?.id as string;
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    try {
      const res = await fetch(`/api/trips/${tripId}/bids`);
      if (res.ok) setBids((await res.json()).bids || []);
    } catch {}
    setLoading(false);
  }, [tripId]);

  useEffect(() => { fetchBids(); const iv = setInterval(fetchBids, 8000); return () => clearInterval(iv); }, [fetchBids]);

  async function handleAccept(bidId: string) {
    setAcceptingId(bidId);
    try {
      const res = await fetch(`/api/trips/${tripId}/accept`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bidId }) });
      if (res.ok) router.push(`/customer/trip/${tripId}`);
    } catch {}
    setAcceptingId(null);
  }

  async function handleReject(bidId: string) {
    try { await fetch(`/api/bids/${bidId}/reject`, { method: "POST" }); setBids((prev) => prev.filter((b) => b.id !== bidId)); } catch {}
  }

  const minPrice = bids.length > 0 ? Math.min(...bids.map((b) => b.price)) : 0;

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <Header title="العروض والمزايدات" backHref="/customer/dashboard" />

      <main className="flex-grow p-4 max-w-lg mx-auto w-full">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[{ label: "العروض", value: bids.length }, { label: "أقل سعر", value: bids.length ? `${minPrice.toFixed(2)} LYD` : "—" }].map((s) => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-[#091426]">{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? <div className="text-center py-12 text-gray-400">جاري التحميل...</div> :
         bids.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300">move_to_inbox</span>
            <h2 className="text-lg font-bold text-[#091426] mt-4 mb-2">لا توجد عروض</h2>
            <p className="text-sm text-gray-500">سيظهر السائقون المهتمون هنا فور تقديم عروضهم</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bids.sort((a, b) => a.price - b.price).map((bid) => (
              <div key={bid.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-[#091426]">{bid.driver?.user?.name || "سائق"}</h3>
                    <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
                      <span>⭐ {bid.driver?.rating?.toFixed(1) || "—"}</span>
                      <span>·</span>
                      <span>{bid.driver?.totalTrips || 0} رحلة</span>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#E05A2B]">{bid.price.toFixed(2)} <span className="text-sm font-normal text-gray-400">LYD</span></p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAccept(bid.id)} disabled={acceptingId === bid.id} className="flex-grow bg-[#E05A2B] text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50">{acceptingId === bid.id ? "جاري..." : "قبول"}</button>
                  <button onClick={() => handleReject(bid.id)} className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-500 font-bold text-sm hover:bg-gray-50">رفض</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
