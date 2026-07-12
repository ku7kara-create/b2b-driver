"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface TripRequest {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  cargoDetails: string | null;
  status: string;
  createdAt: string;
}

export default function DriverBidsListPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/driver/trips");
        if (res.ok) {
          const data = await res.json();
          setRequests(data.trips || []);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50">
        <div className="flex flex-row-reverse justify-between items-center w-full px-4 py-2 max-w-5xl mx-auto h-16">
          <Link href="/driver/dashboard" className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-primary">arrow_forward</span>
          </Link>
          <h1 className="text-xl font-bold text-primary">العروض المتاحة</h1>
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-semibold text-on-surface">طلبات الشحن النشطة</h2>
            <p className="text-sm text-on-surface-variant">يوجد {requests.length} طلباً ينتظر عروضك</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">جاري التحميل...</div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white border border-outline-variant rounded-xl text-center">
            <span className="material-symbols-outlined text-6xl text-outline">inbox</span>
            <h3 className="text-lg font-semibold text-primary mt-4">لا توجد عروض حالياً</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((trip) => (
              <div
                key={trip.id}
                className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm flex flex-col hover:border-secondary transition-colors"
              >
                <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary-fixed">person</span>
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">طلب #{trip.id.slice(-8)}</p>
                      <p className="text-xs text-on-surface-variant">
                        {new Date(trip.createdAt).toLocaleTimeString("ar")}
                      </p>
                    </div>
                  </div>
                  <span className="bg-secondary-fixed text-secondary text-xs font-bold px-2 py-1 rounded-md">
                    {trip.serviceType === "car" ? "سيارة" : trip.serviceType === "porter" ? "بورتر" : "ساحبة"}
                  </span>
                </div>
                <div className="p-4 flex-grow space-y-4">
                  <div className="relative pr-8 border-r-2 border-dashed border-outline-variant space-y-6 mr-1">
                    <div className="relative">
                      <div className="absolute -right-[33px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-white"></div>
                      <p className="text-xs text-on-surface-variant">نقطة الانطلاق</p>
                      <p className="text-sm text-on-surface">{trip.pickupAddress}</p>
                    </div>
                    <div className="relative">
                      <div className="absolute -right-[33px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-white"></div>
                      <p className="text-xs text-on-surface-variant">وجهة الوصول</p>
                      <p className="text-sm text-on-surface">{trip.dropoffAddress}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-surface-container-low border-t border-outline-variant">
                  <button
                    onClick={() => router.push(`/driver/bid/${trip.id}`)}
                    className="w-full bg-secondary-container text-white font-bold py-2.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    تقديم عرض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant flex flex-row-reverse justify-around items-center px-3 py-2 shadow-sm">
        <Link href="/driver/dashboard" className="flex flex-col items-center text-on-surface-variant px-3 py-1 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-xs mt-1">الرئيسية</span>
        </Link>
        <Link href="/driver/bid" className="flex flex-col items-center bg-secondary-container text-white rounded-xl px-3 py-1">
          <span className="material-symbols-outlined">local_shipping</span>
          <span className="text-xs mt-1 font-bold">العروض</span>
        </Link>
        <Link href="/driver/subscription" className="flex flex-col items-center text-on-surface-variant px-3 py-1 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-xs mt-1">المحفظة</span>
        </Link>
        <Link href="/login" className="flex flex-col items-center text-on-surface-variant px-3 py-1 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-xs mt-1">الحساب</span>
        </Link>
      </nav>
    </div>
  );
}
