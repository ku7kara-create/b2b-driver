"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface TripRequest {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  cargoDetails: string | null;
  status: string;
  createdAt: string;
}

const SERVICE_LABELS: Record<string, string> = {
  car: "سيارة خاصة", porter: "بورتر", tow_truck: "ساحبة",
};

export default function DriverDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [earnings, setEarnings] = useState({ today: 0, trips: 0, total: 0 });
  const [subscriptionActive, setSubscriptionActive] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/trips");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.trips || []);
        setSubscriptionActive(true);
      } else if (res.status === 403) {
        setSubscriptionActive(false);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchRequests().finally(() => setLoading(false));
  }, [fetchRequests]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/driver/earnings");
        if (res.ok) setEarnings(await res.json());
      } catch {}
    })();
  }, []);

  async function toggleOnline() {
    const next = !isOnline;
    setIsOnline(next);
    try {
      await fetch("/api/driver/online", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ online: next }) });
    } catch {}
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-gray-300">lock</span>
          <p className="mt-4 text-gray-500">يجب تسجيل الدخول</p>
          <Link href="/login" className="text-[#E05A2B] font-bold mt-2 block">تسجيل الدخول</Link>
        </div>
      </div>
    );
  }

  if (!subscriptionActive) {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-red-500">lock</span>
          </div>
          <h2 className="text-2xl font-bold text-[#091426] mb-3">الاشتراك غير مفعل</h2>
          <p className="text-gray-500 mb-6">يجب تفعيل الاشتراك الشهري (150 LYD) للوصول إلى طلبات العملاء.</p>
          <Link href="/driver/subscription" className="inline-block bg-[#E05A2B] text-white font-bold px-8 py-3 rounded-xl">
            تفعيل الاشتراك الآن
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200 flex flex-row-reverse justify-between items-center px-4 h-16">
        <h1 className="text-xl font-bold text-[#091426]">سائق B2B</h1>
        <button onClick={fetchRequests} className="p-2 rounded-full hover:bg-gray-100">
          <span className="material-symbols-outlined text-gray-500">refresh</span>
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div>
            <span className="text-sm text-gray-500">حالة الاتصال</span>
            <span className={`text-lg font-bold block ${isOnline ? "text-[#E05A2B]" : "text-gray-400"}`}>
              {isOnline ? "متصل" : "غير متصل"}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input checked={isOnline} onChange={toggleOnline} className="sr-only peer" type="checkbox" />
            <div className="w-14 h-8 bg-gray-300 rounded-full peer peer-checked:bg-[#E05A2B] after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:-translate-x-6"></div>
          </label>
        </div>

        <div className="bg-[#1e293b] text-white rounded-xl p-5 relative overflow-hidden">
          <span className="text-xs text-gray-400 block mb-1">أرباح اليوم</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{earnings.today.toFixed(2)}</span>
            <span className="text-sm text-gray-400">LYD</span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-gray-400">الرحلات: <strong className="text-white">{earnings.trips}</strong></span>
            <span className="text-xs text-gray-400">الإجمالي: <strong className="text-white">{earnings.total}</strong></span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#091426]">طلبات قريبة</h2>
          <button onClick={() => { setLoading(true); fetchRequests().finally(() => setLoading(false)); }} className="text-[#E05A2B] text-sm font-medium">تحديث</button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-gray-300">inbox</span>
            <p className="mt-4 text-gray-500">لا توجد طلبات قريبة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((trip) => (
              <div key={trip.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#E05A2B]">
                      {trip.serviceType === "car" ? "directions_car" : trip.serviceType === "porter" ? "local_shipping" : "precision_manufacturing"}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-[#091426] text-sm">{SERVICE_LABELS[trip.serviceType]}</span>
                    <p className="text-xs text-gray-500 truncate max-w-[180px]">{trip.pickupAddress}</p>
                  </div>
                </div>
                <button onClick={() => router.push(`/driver/bid/${trip.id}`)}
                  className="bg-[#E05A2B] text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm">
                  عرض
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 flex flex-row-reverse justify-around items-center py-2 shadow-sm">
        {[
          { href: "/driver/dashboard", icon: "dashboard", label: "الرئيسية" },
          { href: "/driver/bid", icon: "local_shipping", label: "العروض" },
          { href: "/driver/subscription", icon: "credit_card", label: "الاشتراك" },
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
