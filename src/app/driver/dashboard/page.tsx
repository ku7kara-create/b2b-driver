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
  vehicleMakeModel: string | null;
  status: string;
  createdAt: string;
}

const SERVICE_LABELS: Record<string, string> = {
  car: "سيارة خاصة",
  porter: "بورتر",
  tow_truck: "ساحبة",
};

export default function DriverDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [earnings, setEarnings] = useState({ today: 0, trips: 0, hours: 0 });

  async function fetchRequests() {
    try {
      const res = await fetch("/api/driver/trips");
      if (res.ok) {
        const data = await res.json();
        setRequests(data.trips || []);
      }
    } catch {}
  }

  useEffect(() => {
    setLoading(true);
    fetchRequests().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const res = await fetch("/api/driver/earnings");
        if (res.ok) {
          const data = await res.json();
          setEarnings(data);
        }
      } catch {}
    }
    loadEarnings();
  }, []);

  async function toggleOnline() {
    const newState = !isOnline;
    setIsOnline(newState);
    try {
      await fetch("/api/driver/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ online: newState }),
      });
    } catch {}
  }

  return (
    <div className="min-h-screen bg-surface pb-24">
      <header className="w-full sticky top-0 z-50 bg-surface border-b border-outline-variant flex flex-row-reverse justify-between items-center px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">سائق B2B</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="material-symbols-outlined text-primary cursor-pointer p-2 rounded-full hover:bg-surface-container-low">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary-container rounded-full border-2 border-surface"></span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 mb-24">
        {/* Online Toggle */}
        <div className="flex items-center justify-between bg-white border border-outline-variant rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex flex-col">
            <span className="text-base text-on-surface-variant">حالة الاتصال</span>
            <span className={`text-xl font-bold ${isOnline ? "text-secondary-container" : "text-on-surface-variant"}`}>
              {isOnline ? "متصل" : "غير متصل"}
            </span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input checked={isOnline} onChange={toggleOnline} className="sr-only peer" type="checkbox" />
            <div className="w-14 h-8 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:bg-secondary-container after:content-[''] after:absolute after:top-1 after:right-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:-translate-x-6"></div>
          </label>
        </div>

        {/* Earnings Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8">
          <div className="md:col-span-8 bg-primary-container text-white rounded-xl p-6 relative overflow-hidden min-h-[180px]">
            <div className="relative z-10">
              <span className="text-sm text-on-primary-container uppercase tracking-wider block mb-1">
                أرباح اليوم
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-white">{earnings.today.toFixed(2)}</span>
                <span className="text-lg text-on-primary-container">LYD</span>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-4 mt-4">
              <div className="flex flex-col">
                <span className="text-xs text-on-primary-container">عدد الرحلات</span>
                <span className="text-xl font-bold text-white">{earnings.trips}</span>
              </div>
              <div className="h-10 w-px bg-on-primary-container/30"></div>
              <div className="flex flex-col">
                <span className="text-xs text-on-primary-container">ساعات العمل</span>
                <span className="text-xl font-bold text-white">{earnings.hours}</span>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary-container opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <span className="material-symbols-outlined text-7xl">account_balance_wallet</span>
            </div>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4">
            <Link
              href="/driver/trips"
              className="bg-white border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center gap-1 hover:bg-surface-container-low transition-colors group"
            >
              <span className="material-symbols-outlined text-secondary-container text-2xl group-hover:scale-110 transition-transform">
                history
              </span>
              <span className="text-sm text-on-surface">سجل الرحلات</span>
            </Link>
            <Link
              href="/driver/subscription"
              className="bg-white border border-outline-variant rounded-xl p-4 flex flex-col items-center justify-center gap-1 hover:bg-surface-container-low transition-colors group"
            >
              <span className="material-symbols-outlined text-secondary-container text-2xl group-hover:scale-110 transition-transform">
                credit_card
              </span>
              <span className="text-sm text-on-surface">الاشتراك</span>
            </Link>
          </div>
        </div>

        {/* Nearby Requests */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-on-surface">طلبات قريبة</h2>
            <button onClick={() => { setLoading(true); fetchRequests().finally(() => setLoading(false)); }} className="text-secondary text-sm font-medium hover:underline">
              تحديث
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-on-surface-variant">جاري تحميل الطلبات...</div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-outline-variant rounded-xl">
              <span className="material-symbols-outlined text-6xl text-outline">inbox</span>
              <h3 className="text-lg font-semibold text-primary mt-4 mb-2">لا توجد طلبات قريبة</h3>
              <p className="text-sm text-on-surface-variant">
                ستظهر هنا طلبات العملاء القريبين منك
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white border border-outline-variant rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">
                        {trip.serviceType === "car" ? "directions_car" : trip.serviceType === "porter" ? "local_shipping" : "precision_manufacturing"}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-on-surface">
                          {trip.serviceType === "car" ? "توصيل" : trip.serviceType === "porter" ? "نقل بضائع" : "سحب مركبة"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-on-surface-variant mt-1">
                        <span className="material-symbols-outlined text-base">location_on</span>
                        <span className="text-sm">{trip.pickupAddress}  ←  {trip.dropoffAddress}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full md:w-auto md:gap-8">
                    <div className="flex flex-col text-right">
                      <span className="text-xs text-on-surface-variant">نوع الخدمة</span>
                      <span className="font-bold text-secondary-container">
                        {SERVICE_LABELS[trip.serviceType]}
                      </span>
                    </div>
                    <button
                      onClick={() => router.push(`/driver/bid/${trip.id}`)}
                      className="bg-secondary-container text-white px-6 py-2 rounded-lg font-bold hover:bg-secondary transition-colors text-sm shadow-sm"
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant flex flex-row-reverse justify-around items-center px-3 py-2 shadow-sm">
        <Link href="/driver/dashboard" className="flex flex-col items-center justify-center bg-secondary-container text-white rounded-xl px-3 py-1 scale-95">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-xs mt-1">الرئيسية</span>
        </Link>
        <Link href="/driver/bid" className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors px-3 py-1">
          <span className="material-symbols-outlined">local_shipping</span>
          <span className="text-xs mt-1">العروض</span>
        </Link>
        <Link href="/driver/subscription" className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors px-3 py-1">
          <span className="material-symbols-outlined">account_balance_wallet</span>
          <span className="text-xs mt-1">المحفظة</span>
        </Link>
        <Link href="/login" className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors px-3 py-1">
          <span className="material-symbols-outlined">person</span>
          <span className="text-xs mt-1">الحساب</span>
        </Link>
      </nav>
    </div>
  );
}
