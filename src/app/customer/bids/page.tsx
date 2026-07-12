"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function CustomerBidsListPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/trips");
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
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky top-0 z-40 bg-surface border-b border-outline-variant flex flex-row-reverse items-center w-full px-4 h-16">
        <Link href="/customer/dashboard" className="p-2 hover:bg-surface-container-low rounded-full">
          <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
        </Link>
        <h1 className="text-xl font-semibold text-on-surface mr-4">طلباتي</h1>
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {loading ? (
          <div className="text-center py-12 text-on-surface-variant">جاري التحميل...</div>
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="material-symbols-outlined text-6xl text-outline">inbox</span>
            <p className="mt-4 text-on-surface-variant">لا توجد طلبات حتى الآن</p>
            <Link href="/customer/request" className="text-secondary font-bold mt-2">
              طلب خدمة جديدة
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip: any) => (
              <Link
                key={trip.id}
                href={
                  trip.status === "accepted"
                    ? `/customer/trip/${trip.id}`
                    : `/customer/bids/${trip.id}`
                }
                className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm flex justify-between items-center hover:border-secondary transition-colors block"
              >
                <div>
                  <h3 className="font-bold text-primary">طلب #{trip.id.slice(-8)}</h3>
                  <p className="text-sm text-on-surface-variant">
                    {trip.serviceType === "car"
                      ? "سيارة خاصة"
                      : trip.serviceType === "porter"
                        ? "بورتر"
                        : "ساحبة"}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    trip.status === "accepted"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {trip.status === "accepted" ? "نشط" : "معلق"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
