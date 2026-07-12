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

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant flex flex-row-reverse justify-between items-center w-full px-4 h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-white">person</span>
          </div>
          <div className="text-right">
            <p className="text-sm text-on-surface-variant">أهلاً</p>
            <p className="font-semibold text-primary">سائق</p>
          </div>
        </div>
        <h1 className="text-xl font-bold text-secondary">B2B Driver</h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-primary">الطلبات القريبة</h2>
          <button
            onClick={() => { setLoading(true); fetchRequests().finally(() => setLoading(false)); }}
            className="text-secondary text-sm font-medium hover:underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">جاري تحميل الطلبات...</div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
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
                className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm hover:border-secondary transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="bg-secondary-fixed text-secondary text-xs font-bold px-2 py-1 rounded-full">
                      {SERVICE_LABELS[trip.serviceType]}
                    </span>
                    <h3 className="text-lg font-bold text-primary mt-2">طلب #{trip.id.slice(-8)}</h3>
                  </div>
                  <span className="text-xs text-on-surface-variant">
                    {new Date(trip.createdAt).toLocaleTimeString("ar")}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-green-500 text-lg">trip_origin</span>
                    <span className="text-on-surface">{trip.pickupAddress}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-red-500 text-lg">location_on</span>
                    <span className="text-on-surface">{trip.dropoffAddress}</span>
                  </div>
                  {trip.cargoDetails && (
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">inventory_2</span>
                      <span>{trip.cargoDetails.slice(0, 80)}...</span>
                    </div>
                  )}
                  {trip.vehicleMakeModel && (
                    <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-lg">directions_car</span>
                      <span>{trip.vehicleMakeModel}</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => router.push(`/driver/bid/${trip.id}`)}
                  className="w-full bg-secondary-container text-white font-bold py-3 rounded-lg hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  تقديم عرض سعر
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      <nav className="bg-surface-container-lowest border-t border-outline-variant fixed bottom-0 w-full z-50 shadow-md flex flex-row-reverse justify-around items-center py-2">
        <Link href="/driver/dashboard" className="flex flex-col items-center justify-center text-secondary font-bold scale-110">
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs">الرئيسية</span>
        </Link>
        <Link href="/driver/subscription" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary-container transition-all">
          <span className="material-symbols-outlined">credit_card</span>
          <span className="text-xs">الاشتراك</span>
        </Link>
        <a className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary-container transition-all relative" href="#">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-xs">التنبيهات</span>
        </a>
        <Link href="/login" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary-container transition-all">
          <span className="material-symbols-outlined">person</span>
          <span className="text-xs">الحساب</span>
        </Link>
      </nav>
    </div>
  );
}
