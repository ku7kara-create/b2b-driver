"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface Bid {
  id: string;
  tripId: string;
  driverId: string;
  price: number;
  status: string;
  createdAt: string;
  driver: {
    id: string;
    user: {
      name: string;
      phone: string;
    };
    rating: number;
    totalTrips: number;
    subscriptionStatus: string;
  };
}

export default function CustomerBidsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string;
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  async function fetchBids() {
    try {
      const res = await fetch(`/api/trips/${tripId}/bids`);
      if (res.ok) {
        const data = await res.json();
        setBids(data.bids || []);
      }
    } catch {
      setError("تعذر تحميل العروض");
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchBids();
    const interval = setInterval(fetchBids, 5000);
    return () => clearInterval(interval);
  }, [tripId]);

  async function handleAccept(bidId: string) {
    setAcceptingId(bidId);
    try {
      const res = await fetch(`/api/trips/${tripId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/customer/trip/${data.tripId}`);
      } else {
        const data = await res.json();
        setError(data.error || "فشل قبول العرض");
      }
    } catch {
      setError("تعذر الاتصال بالخادم");
    }
    setAcceptingId(null);
  }

  async function handleReject(bidId: string) {
    try {
      await fetch(`/api/bids/${bidId}/reject`, { method: "POST" });
      setBids((prev) => prev.filter((b) => b.id !== bidId));
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      <header className="sticky top-0 z-40 bg-surface border-b border-outline-variant flex flex-row-reverse justify-between items-center w-full px-4 h-16">
        <div className="flex items-center gap-4">
          <Link href="/customer/dashboard" className="p-2 hover:bg-surface-container-low rounded-full">
            <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
          </Link>
          <h1 className="text-xl font-semibold text-on-surface">العروض والمزايدات</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-surface-container-low p-2 rounded-full">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 max-w-3xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border-r-4 border-r-secondary flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant mb-1">إجمالي العروض</p>
              <p className="text-2xl font-bold text-on-surface">{bids.length}</p>
            </div>
            <div className="bg-secondary-fixed p-3 rounded-lg">
              <span className="material-symbols-outlined text-secondary">gavel</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border-r-4 border-r-blue-500 flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant mb-1">أقل سعر</p>
              <p className="text-2xl font-bold text-on-surface">
                {bids.length > 0 ? Math.min(...bids.map((b) => b.price)).toFixed(2) : "—"}
              </p>
            </div>
            <div className="bg-surface-container-high p-3 rounded-lg">
              <span className="material-symbols-outlined text-blue-500">payments</span>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-sm border-r-4 border-r-primary flex items-center justify-between">
            <div>
              <p className="text-sm text-on-surface-variant mb-1">متوسط السعر</p>
              <p className="text-2xl font-bold text-on-surface">
                {bids.length > 0
                  ? (bids.reduce((s, b) => s + b.price, 0) / bids.length).toFixed(2)
                  : "—"}
              </p>
            </div>
            <div className="bg-primary-fixed p-3 rounded-lg">
              <span className="material-symbols-outlined text-primary">timer</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">جاري تحميل العروض...</div>
        ) : bids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="bg-surface-container p-8 rounded-full mb-6">
              <span className="material-symbols-outlined text-outline text-6xl">move_to_inbox</span>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2">لا توجد عروض حالياً</h2>
            <p className="text-base text-on-surface-variant max-w-sm">
              سيظهر السائقون المهتمون بشحنتك هنا فور تقديم عروضهم.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-4 flex-col md:flex-row">
                  <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                      person
                    </span>
                  </div>
                  <div className="flex-grow w-full">
                    <div className="flex flex-wrap justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-on-surface">
                          {bid.driver?.user?.name || "سائق"}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="flex items-center text-yellow-500">
                            <span className="material-symbols-outlined text-sm">star</span>
                            <span className="text-sm font-bold mr-1">
                              {bid.driver?.rating?.toFixed(1) || "—"}
                            </span>
                          </div>
                          <span className="text-outline text-xs">|</span>
                          <span className="text-sm text-on-surface-variant">
                            {bid.driver?.totalTrips || 0} رحلة مكتملة
                          </span>
                        </div>
                      </div>
                      <div className="text-left mt-2 md:mt-0">
                        <p className="text-2xl font-bold text-primary">
                          {bid.price.toFixed(2)} <span className="text-sm font-normal">LYD</span>
                        </p>
                        <p className="text-xs text-on-surface-variant">شامل الضريبة</p>
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-outline-variant pt-4 mt-4">
                      <button
                        onClick={() => handleAccept(bid.id)}
                        disabled={acceptingId === bid.id}
                        className="flex-grow bg-secondary-container text-white font-bold py-2.5 px-6 rounded-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        {acceptingId === bid.id ? (
                          <>
                            <span className="material-symbols-outlined animate-spin">sync</span>
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
