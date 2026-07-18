"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Trip {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  agreedPrice: number;
  createdAt: string;
}

interface Bid {
  id: string; driverId: string; price: number; status: string;
  driver?: { user?: { name: string }; rating: number; totalTrips: number } | null;
}

const SERVICE_LABELS: Record<string, string> = {
  private_car: "سيارة خاصة", car: "سيارة خاصة", porter: "بورتر", porter_canter: "بورتر", tow_truck: "ساحبة",
};

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [bidPolling, setBidPolling] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [activeRes, allRes] = await Promise.all([
        fetch("/api/trips?status=active"),
        fetch("/api/trips"),
      ]);
      if (activeRes.ok) {
        const d = await activeRes.json();
        setActiveTrip(d.activeTrip || null);
      }
      if (allRes.ok) {
        const d = await allRes.json();
        setRecentTrips((d.trips || []).slice(0, 5));
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [fetchData]);

  useEffect(() => {
    if (!activeTrip || activeTrip.status !== "pending" || !bidPolling) return;
    const fetchBids = async () => {
      try {
        const r = await fetch(`/api/trips/${activeTrip.id}/bids`);
        if (r.ok) {
          const d = await r.json();
          setBids(d.bids || []);
        }
      } catch {}
    };
    fetchBids();
    const iv = setInterval(fetchBids, 8000);
    return () => clearInterval(iv);
  }, [activeTrip?.id, activeTrip?.status, bidPolling]);

  async function handleAccept(bidId: string) {
    if (!activeTrip) return;
    setAcceptingId(bidId);
    try {
      const res = await fetch(`/api/trips/${activeTrip.id}/accept`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bidId }),
      });
      if (res.ok) {
        setBidPolling(false);
        router.push(`/customer/trip/${activeTrip.id}`);
      }
    } catch {}
    setAcceptingId(null);
  }

  async function handleReject(bidId: string) {
    try {
      await fetch(`/api/bids/${bidId}/reject`, { method: "POST" });
      setBids((prev) => prev.filter((b) => b.id !== bidId));
    } catch {}
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200 flex flex-row-reverse justify-between items-center w-full px-4 h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-white">
            <span className="material-symbols-outlined">person</span>
          </div>
          <p className="text-sm font-medium text-gray-700">مرحباً</p>
        </div>
        <h1 className="text-xl font-bold text-[#E05A2B]">B2B Driver</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-4 space-y-6">
        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : (
          <>
            {activeTrip && (
              <section>
                <h2 className="text-lg font-semibold text-[#091426] mb-3">الطلب الحالي</h2>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300">map</span>
                  </div>
                  <div className="p-4 bg-[#1e293b] text-white">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">رقم الطلب</p>
                        <p className="text-lg font-bold">#{activeTrip.id.slice(-8)}</p>
                      </div>
                      <span className="bg-[#E05A2B] px-2 py-1 rounded-full text-xs font-bold">
                        {activeTrip.status === "accepted" ? "نشط" : "معلق"}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-300">
                      {activeTrip.pickupAddress} → {activeTrip.dropoffAddress}
                    </div>
                  </div>
                  {activeTrip.status === "pending" && (
                    <div className="p-4">
                      <h3 className="font-bold text-[#091426] mb-3">العروض المقدمة ({bids.length})</h3>
                      {bids.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-4">بانتظار عروض السائقين...</p>
                      ) : (
                        <div className="space-y-2">
                          {bids.sort((a, b) => a.price - b.price).map((bid) => (
                            <div key={bid.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-bold text-sm text-[#091426]">{bid.driver?.user?.name || "سائق"}</p>
                                <p className="text-xs text-gray-500">⭐ {(bid.driver?.rating || 0).toFixed(1)} · {bid.driver?.totalTrips || 0} رحلة</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#E05A2B]">{bid.price.toFixed(2)} LYD</span>
                                <button onClick={() => handleAccept(bid.id)} disabled={acceptingId === bid.id}
                                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold disabled:opacity-50"
                                >{acceptingId === bid.id ? "..." : "قبول"}</button>
                                <button onClick={() => handleReject(bid.id)}
                                  className="text-red-500 text-xs font-bold px-2 py-1.5"
                                >رفض</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            <section>
              <h2 className="text-lg font-semibold text-[#091426] mb-3">طلب خدمة جديدة</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: "private_car", label: "سيارة خاصة", icon: "directions_car" },
                  { type: "porter", label: "بورتر", icon: "local_shipping" },
                  { type: "tow_truck", label: "ساحبة", icon: "precision_manufacturing" },
                ].map((svc) => (
                  <Link key={svc.type} href={`/customer/request?type=${svc.type}`}
                    className="bg-white border border-gray-200 p-4 rounded-xl text-center hover:border-[#E05A2B] transition-all group"
                  >
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-orange-50">
                      <span className="material-symbols-outlined text-[#E05A2B]">{svc.icon}</span>
                    </div>
                    <span className="text-sm font-medium text-[#091426]">{svc.label}</span>
                  </Link>
                ))}
              </div>
            </section>

            {recentTrips.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-[#091426] mb-3">آخر الرحلات</h2>
                <div className="space-y-2">
                  {recentTrips.map((trip) => (
                    <Link key={trip.id} href={`/customer/trip/${trip.id}`}
                      className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center hover:border-[#E05A2B] transition-colors block"
                    >
                      <div>
                        <h3 className="font-bold text-[#091426] text-sm">{SERVICE_LABELS[trip.serviceType]}</h3>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{trip.pickupAddress}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${trip.status === "completed" ? "bg-green-100 text-green-700" : trip.status === "accepted" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {trip.status === "completed" ? "مكتمل" : trip.status === "accepted" ? "نشط" : "معلق"}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 flex flex-row-reverse justify-around items-center py-2 shadow-sm">
        {[
          { href: "/customer/dashboard", icon: "home", label: "الرئيسية" },
          { href: "/customer/request", icon: "add_circle", label: "طلب جديد" },
          { href: "/customer/bids", icon: "local_shipping", label: "الطلبات" },
          { href: "/customer/profile", icon: "person", label: "حسابي" },
        ].map((it) => (
          <Link key={it.href} href={it.href} className="flex flex-col items-center text-gray-400 hover:text-[#E05A2B] px-3 py-1">
            <span className="material-symbols-outlined">{it.icon}</span>
            <span className="text-xs mt-1">{it.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
