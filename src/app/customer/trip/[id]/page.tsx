"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface TripData {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  agreedPrice: number;
  driver?: {
    id: string;
    user: { name: string; phone: string };
    rating: number;
    totalTrips: number;
    subscriptionStatus: string;
  };
}

const SERVICE_LABELS: Record<string, string> = {
  car: "سيارة خاصة",
  porter: "بورتر",
  tow_truck: "ساحبة",
};

export default function CustomerTripPage() {
  const params = useParams();
  const tripId = params?.id as string;
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(12);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setTrip(data.trip);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [tripId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-on-surface-variant">جاري التحميل...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-outline">error</span>
          <p className="mt-4 text-on-surface-variant">الرحلة غير موجودة</p>
          <Link href="/customer/dashboard" className="text-secondary font-bold mt-2 block">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-background">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-8xl text-outline opacity-30">map</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background/40 pointer-events-none"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-xl mx-auto flex flex-row-reverse items-center justify-between bg-white/90 backdrop-blur-md border border-outline-variant/50 px-4 h-16 rounded-xl shadow-lg">
          <Link href="/customer/dashboard" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-primary text-2xl">arrow_forward</span>
          </Link>
          <div className="flex flex-col items-end">
            <h1 className="text-lg font-semibold text-primary leading-tight">تتبع مباشر</h1>
            <span className="text-xs text-on-surface-variant">طلب #{trip.id.slice(-8)}</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="relative z-10 w-full h-full pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-secondary px-3 py-1 rounded-lg shadow-lg mb-1">
            <p className="text-white text-sm font-medium">{eta} دقيقة</p>
          </div>
          <span className="material-symbols-outlined text-secondary text-5xl">location_on</span>
        </div>
      </main>

      <section className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-6 border border-outline-variant/50">
          <div className="w-12 h-1 bg-outline-variant rounded-full mx-auto mb-6"></div>

          <div className="mb-6">
            <div className="flex justify-between items-end mb-3">
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-sm">الوصول المتوقع</span>
                <h2 className="text-primary text-3xl font-bold leading-none">{eta} دقيقة</h2>
              </div>
              <div className="bg-surface-container text-secondary text-sm font-medium px-3 py-1 rounded-full">
                {trip.status === "accepted" ? "في الطريق" : "بانتظار"}
              </div>
            </div>
            <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-2/3 rounded-full"></div>
            </div>
          </div>

          {trip.driver && (
            <div className="flex flex-row-reverse items-center justify-between bg-surface-container-lowest border border-outline-variant p-4 rounded-lg mb-6">
              <div className="flex flex-row-reverse items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl">person</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="material-symbols-outlined text-xs">star</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h3 className="font-semibold text-primary">{trip.driver.user.name}</h3>
                  <div className="flex flex-row-reverse items-center gap-1">
                    <span className="text-on-surface-variant text-xs">
                      {trip.driver.rating?.toFixed(1)} ({trip.driver.totalTrips}+)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <span className="material-symbols-outlined text-on-primary-container text-3xl">
                  local_shipping
                </span>
                <span className="text-on-surface-variant text-xs">
                  {SERVICE_LABELS[trip.serviceType]}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <button className="bg-secondary text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span>اتصال</span>
              <span className="material-symbols-outlined">call</span>
            </button>
            <button className="bg-white border-2 border-primary text-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span>رسالة</span>
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
