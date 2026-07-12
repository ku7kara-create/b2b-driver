"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface DriverTrip {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  cargoDetails: string | null;
  vehicleMakeModel: string | null;
  status: string;
  agreedPrice: number;
  customer: { name: string; phone: string };
}

const SERVICE_LABELS: Record<string, string> = {
  car: "سيارة خاصة",
  porter: "بورتر",
  tow_truck: "ساحبة",
};

export default function DriverTripPage() {
  const params = useParams();
  const tripId = params?.id as string;
  const [trip, setTrip] = useState<DriverTrip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/driver/trips/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setTrip(data.trip);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [tripId]);

  async function updateStatus(status: string) {
    try {
      const res = await fetch(`/api/trips/${tripId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok && trip) {
        setTrip({ ...trip, status });
      }
    } catch {}
  }

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
          <p className="mt-4">الرحلة غير موجودة</p>
          <Link href="/driver/dashboard" className="text-secondary font-bold mt-2 block">
            العودة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface border-b border-outline-variant flex flex-row-reverse items-center w-full px-4 h-16 sticky top-0 z-50">
        <Link href="/driver/dashboard" className="p-2 hover:bg-surface-container-low rounded-full">
          <span className="material-symbols-outlined text-on-surface">arrow_forward</span>
        </Link>
        <h1 className="text-xl font-semibold text-on-surface mr-4">تفاصيل الرحلة</h1>
      </header>

      <main className="flex-grow p-4 max-w-lg mx-auto w-full space-y-4">
        <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <span className="bg-secondary-fixed text-secondary text-xs font-bold px-2 py-1 rounded-full">
              {SERVICE_LABELS[trip.serviceType]}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              trip.status === "accepted" ? "bg-green-100 text-green-700" :
              trip.status === "completed" ? "bg-blue-100 text-blue-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {trip.status === "accepted" ? "قيد التنفيذ" :
               trip.status === "completed" ? "مكتمل" :
               trip.status === "started" ? "جاري" : "—"}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-green-500 mt-1">trip_origin</span>
              <div>
                <p className="text-xs text-on-surface-variant">الانطلاق</p>
                <p className="text-on-surface font-medium">{trip.pickupAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 mt-1">location_on</span>
              <div>
                <p className="text-xs text-on-surface-variant">الوصول</p>
                <p className="text-on-surface font-medium">{trip.dropoffAddress}</p>
              </div>
            </div>
            {trip.agreedPrice && (
              <div className="bg-surface-container-low p-3 rounded-lg text-center">
                <p className="text-xs text-on-surface-variant">السعر المتفق عليه</p>
                <p className="text-2xl font-bold text-primary">{trip.agreedPrice.toFixed(2)} LYD</p>
              </div>
            )}
            {trip.customer && (
              <div className="bg-surface-container-low p-3 rounded-lg">
                <p className="text-xs text-on-surface-variant mb-1">العميل</p>
                <p className="font-bold">{trip.customer.name}</p>
                <p className="text-sm text-on-surface-variant">{trip.customer.phone}</p>
              </div>
            )}
          </div>
        </div>

        {trip.status === "accepted" && (
          <div className="space-y-3">
            <button
              onClick={() => updateStatus("started")}
              className="w-full bg-secondary-container text-white font-bold py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
            >
              بدء الرحلة
            </button>
          </div>
        )}

        {trip.status === "started" && (
          <div className="space-y-3">
            <button
              onClick={() => updateStatus("completed")}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all"
            >
              إتمام الرحلة
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
