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
      <div className="min-h-screen bg-background flex items-center justify-center text-on-surface-variant">
        جاري التحميل...
      </div>
    );
  }

  if (!trip || error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-outline">error</span>
          <p className="mt-4 text-on-surface-variant">{error || "الرحلة غير موجودة"}</p>
          <Link href="/driver/dashboard" className="text-secondary font-bold mt-2 block">العودة</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50">
        <div className="flex flex-row-reverse justify-between items-center w-full px-4 py-2 max-w-5xl mx-auto h-16">
          <Link href="/driver/dashboard" className="p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-primary">arrow_forward</span>
          </Link>
          <h1 className="text-xl font-bold text-primary">تقديم عرض</h1>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 w-full">
        {/* Route Card */}
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm mb-6">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary-fixed">person</span>
              </div>
              <div>
                <p className="font-medium text-on-surface">عميل</p>
                <p className="text-xs text-on-surface-variant">طلب #{trip.id.slice(-8)}</p>
              </div>
            </div>
            <span className="bg-secondary-fixed text-secondary text-xs font-bold px-2 py-1 rounded-md">
              {SERVICE_LABELS[trip.serviceType]}
            </span>
          </div>

          <div className="p-4 space-y-4">
            {/* Route Visualization */}
            <div className="relative pr-8 border-r-2 border-dashed border-outline-variant space-y-6 mr-1">
              <div className="relative">
                <div className="absolute -right-[33px] top-0 w-4 h-4 rounded-full bg-secondary ring-4 ring-white"></div>
                <p className="text-xs text-on-surface-variant">نقطة الانطلاق</p>
                <p className="text-base text-on-surface font-medium">{trip.pickupAddress}</p>
              </div>
              <div className="relative">
                <div className="absolute -right-[33px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-white"></div>
                <p className="text-xs text-on-surface-variant">وجهة الوصول</p>
                <p className="text-base text-on-surface font-medium">{trip.dropoffAddress}</p>
              </div>
            </div>

            {/* Service Details */}
            {trip.cargoDetails && (
              <div className="bg-surface-container p-3 rounded-lg">
                <p className="text-xs text-on-surface-variant mb-1">تفاصيل البضائع</p>
                <p className="text-sm text-on-surface">{trip.cargoDetails}</p>
              </div>
            )}
            {trip.vehicleMakeModel && (
              <div className="bg-surface-container p-3 rounded-lg">
                <p className="text-xs text-on-surface-variant mb-1">نوع المركبة</p>
                <p className="text-sm text-on-surface font-bold">{trip.vehicleMakeModel}</p>
              </div>
            )}
          </div>

          {/* Price Input */}
          <div className="p-4 bg-surface-container-low border-t border-outline-variant">
            {error && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm text-center mb-3">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <input
                  className="w-full bg-white border border-outline rounded-lg px-4 py-3 focus:ring-2 focus:ring-secondary focus:border-secondary text-base text-right"
                  placeholder="أدخل سعرك"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-medium">
                  LYD
                </span>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className={`w-full font-bold py-3 rounded-lg transition-colors text-base ${
                  submitting
                    ? "bg-outline-variant text-on-surface-variant"
                    : "bg-secondary-container text-white hover:bg-secondary"
                }`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    جارٍ التقديم...
                  </span>
                ) : (
                  "تقديم عرض"
                )}
              </button>
            </form>
          </div>
        </div>
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
