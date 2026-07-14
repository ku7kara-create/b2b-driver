"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface TripDetails {
  id: string; serviceType: string;
  pickupAddress: string; dropoffAddress: string;
  cargoDetails: string | null; vehicleMakeModel: string | null;
  status: string;
}

const SERVICE_LABELS: Record<string, string> = { car: "سيارة خاصة", porter: "بورتر", tow_truck: "ساحبة" };

export default function DriverBidPage() {
  const params = useParams(); const router = useRouter();
  const tripId = params?.tripId as string;
  const [trip, setTrip] = useState<TripDetails | null>(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/driver/trips/${tripId}`);
        if (res.ok) setTrip((await res.json()).trip);
        else setError("الرحلة غير موجودة");
      } catch { setError("تعذر التحميل"); }
      setLoading(false);
    })();
  }, [tripId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    const amount = parseFloat(price);
    if (!amount || amount <= 0) { setError("أدخل سعراً صحيحاً"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/bids", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tripId, price: amount }) });
      const data = await res.json();
      if (res.ok) { setSuccess(true); setTimeout(() => router.push("/driver/dashboard"), 1200); }
      else setError(data.error || "فشل التقديم");
    } catch { setError("تعذر الاتصال"); }
    setSubmitting(false);
  }

  if (loading) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center text-gray-400">جاري التحميل...</div>;
  if (!trip || error) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center"><div className="text-center"><span className="material-symbols-outlined text-6xl text-gray-300">error</span><p className="mt-4 text-gray-500">{error || "غير موجود"}</p><Link href="/driver/dashboard" className="text-[#E05A2B] font-bold mt-2 block">العودة</Link></div></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <header className="bg-white border-b border-gray-200 flex flex-row-reverse items-center w-full px-4 h-16 sticky top-0 z-50">
        <Link href="/driver/dashboard" className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">arrow_forward</span></Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">{SERVICE_LABELS[trip.serviceType]}</h1>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 mt-0.5">trip_origin</span><div><p className="text-xs text-gray-400">الانطلاق</p><p className="text-sm font-medium text-[#091426]">{trip.pickupAddress}</p></div></div>
            <div className="flex items-start gap-2"><span className="material-symbols-outlined text-red-500 mt-0.5">location_on</span><div><p className="text-xs text-gray-400">الوصول</p><p className="text-sm font-medium text-[#091426]">{trip.dropoffAddress}</p></div></div>
            {trip.cargoDetails && <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600">{trip.cargoDetails}</div>}
            {trip.vehicleMakeModel && <div className="bg-gray-50 p-3 rounded-lg text-sm font-bold text-[#091426]">🚗 {trip.vehicleMakeModel}</div>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center">تم تقديم العرض بنجاح!</div>}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">السعر (LYD)</label>
              <div className="relative" dir="ltr">
                <input type="number" className="w-full h-14 px-3 pr-12 border border-gray-300 rounded-lg focus:border-[#E05A2B] focus:ring-1 focus:ring-[#E05A2B] text-lg font-bold text-right" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">LYD</span>
              </div>
            </div>
            <button type="submit" disabled={submitting || success} className="w-full h-14 bg-[#E05A2B] text-white font-bold text-lg rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><span className="animate-spin">⏳</span> جاري التقديم...</> : success ? "✓ تم" : "تقديم العرض"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
