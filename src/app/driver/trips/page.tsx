"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";

interface Trip {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  agreedPrice: number;
  createdAt: string;
  completedAt: string | null;
}

export default function DriverTripHistoryPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/driver/trips/history");
        if (res.ok) {
          const data = await res.json();
          setTrips(data.trips || []);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="سجل الرحلات" backHref="/driver/dashboard" />

      <main className="max-w-2xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">جاري التحميل...</div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-outline">history</span>
            <p className="mt-4 text-on-surface-variant">لا توجد رحلات حتى الآن</p>
          </div>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/driver/trip/${trip.id}`}
                className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm flex justify-between items-center hover:border-secondary transition-colors block"
              >
                <div>
                  <h3 className="font-bold text-primary">طلب #{trip.id.slice(-8)}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {trip.serviceType === "car" ? "سيارة" : trip.serviceType === "porter" ? "بورتر" : "ساحبة"}
                    {" · "}{trip.pickupAddress}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {new Date(trip.createdAt).toLocaleDateString("ar")}
                  </p>
                </div>
                <div className="text-left">
                  {trip.agreedPrice && (
                    <p className="font-bold text-secondary">{trip.agreedPrice.toFixed(2)} LYD</p>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    trip.status === "completed" ? "bg-green-100 text-green-700" :
                    trip.status === "accepted" ? "bg-blue-100 text-blue-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {trip.status === "completed" ? "مكتمل" : trip.status === "accepted" ? "نشط" : "معلق"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-outline-variant flex flex-row-reverse justify-around items-center px-3 py-2 shadow-sm">
        <Link href="/driver/dashboard" className="flex flex-col items-center text-on-surface-variant px-3 py-1 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-xs mt-1">الرئيسية</span>
        </Link>
        <Link href="/driver/trips" className="flex flex-col items-center bg-secondary-container text-white rounded-xl px-3 py-1">
          <span className="material-symbols-outlined">history</span>
          <span className="text-xs mt-1 font-bold">السجل</span>
        </Link>
        <Link href="/driver/subscription" className="flex flex-col items-center text-on-surface-variant px-3 py-1 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">credit_card</span>
          <span className="text-xs mt-1">الاشتراك</span>
        </Link>
        <Link href="/login" className="flex flex-col items-center text-on-surface-variant px-3 py-1 hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined">person</span>
          <span className="text-xs mt-1">الحساب</span>
        </Link>
      </nav>
    </div>
  );
}
