"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface TripDetails {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  cargoDetails: string | null;
  vehicleMakeModel: string | null;
  status: string;
}

const SERVICE_LABELS: Record<string, string> = {
  car: "سيارة خاصة",
  porter: "بورتر",
  tow_truck: "ساحبة",
};

export default function DriverBidPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/driver/trips/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setTrip(data.trip);
        } else {
          setError("الرحلة غير موجودة");
        }
      } catch {
        setError("تعذر تحميل التفاصيل");
      }
      setLoading(false);
    }
    load();
  }, [tripId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const amount = parseFloat(price);
    if (!amount || amount <= 0) {
      setError("الرجاء إدخال سعر صحيح");
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch("/api/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, price: amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل تقديم العرض");
      } else {
        router.push("/driver/dashboard");
      }
    } catch {
      setError("تعذر الاتصال بالخادم");
    }
    setSubmitting(false);
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
          <p className="mt-4 text-on-surface-variant">{error || "الرحلة غير موجودة"}</p>
          <Link href="/driver/dashboard" className="text-secondary font-bold mt-2 block">
            العودة للرئيسية
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
        <h1 className="text-xl font-semibold text-on-surface mr-4">تقديم عرض سعر</h1>
      </header>

      <main className="flex-grow flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-lg">
          <div className="bg-white border border-outline-variant rounded-xl p-6 mb-6 shadow-sm">
            <span className="bg-secondary-fixed text-secondary text-xs font-bold px-2 py-1 rounded-full mb-3 inline-block">
              {SERVICE_LABELS[trip.serviceType]}
            </span>

            <div className="space-y-3 my-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-green-500 mt-1">trip_origin</span>
                <div>
                  <p className="text-xs text-on-surface-variant">موقع الانطلاق</p>
                  <p className="text-on-surface font-medium">{trip.pickupAddress}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-red-500 mt-1">location_on</span>
                <div>
                  <p className="text-xs text-on-surface-variant">موقع الوصول</p>
                  <p className="text-on-surface font-medium">{trip.dropoffAddress}</p>
                </div>
              </div>
              {trip.cargoDetails && (
                <div className="bg-surface-container-low p-3 rounded-lg">
                  <p className="text-xs text-on-surface-variant mb-1">تفاصيل البضائع</p>
                  <p className="text-sm text-on-surface">{trip.cargoDetails}</p>
                </div>
              )}
              {trip.vehicleMakeModel && (
                <div className="bg-surface-container-low p-3 rounded-lg">
                  <p className="text-xs text-on-surface-variant mb-1">نوع المركبة</p>
                  <p className="text-sm text-on-surface">{trip.vehicleMakeModel}</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center mb-4">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-on-surface-variant px-1">
                عرض السعر (LYD)
              </label>
              <div className="relative" dir="ltr">
                <input
                  type="number"
                  className="w-full px-3 pr-12 h-14 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-secondary-container text-lg font-bold text-left"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">
                  LYD
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 bg-secondary-container text-white font-bold text-lg rounded-lg shadow-md hover:brightness-110 active:scale-[0.98] transition-all mt-6 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  جاري التقديم...
                </>
              ) : (
                <>
                  <span>تقديم العرض</span>
                  <span className="material-symbols-outlined">send</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
