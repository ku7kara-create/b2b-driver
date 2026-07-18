"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const TripMap = dynamic(() => import("@/components/trip-map").catch(() => ({ default: () => <div className="h-64 bg-gray-100 flex items-center justify-center"><span className="text-gray-400">الخريطة غير متوفرة</span></div> })), { ssr: false });

interface TripDetails {
  id: string; serviceType: string;
  pickupAddress: string; pickupLat: number; pickupLng: number;
  dropoffAddress: string; dropoffLat: number; dropoffLng: number;
  cargoDetails: string | null; cargoPhotos: string | null;
  vehicleMakeModel: string | null; status: string;
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
      <style>{`.clear-bid-input::-webkit-outer-spin-button,.clear-bid-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.clear-bid-input{-moz-appearance:textfield}`}</style>
      <header className="bg-white border-b border-gray-200 flex flex-row-reverse items-center w-full px-4 h-16 sticky top-0 z-50">
        <Link href="/driver/dashboard" className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">arrow_forward</span></Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">تفاصيل الطلب</h1>
      </header>

      <main className="flex-grow p-4 max-w-lg mx-auto w-full space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {trip.pickupLat && trip.dropoffLat ? (
            <TripMap pickup={[trip.pickupLat, trip.pickupLng]} dropoff={[trip.dropoffLat, trip.dropoffLng]} />
          ) : (
            <div className="h-48 bg-gray-100 flex items-center justify-center"><span className="text-gray-400">الخريطة غير متوفرة</span></div>
          )}
          <div className="p-3 border-b border-gray-200 flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#E05A2B]">{SERVICE_LABELS[trip.serviceType]}</span>
            <span className="text-xs text-gray-400">طلب #{trip.id.slice(-8)}</span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-green-500 mt-0.5">trip_origin</span>
              <div className="flex-1"><p className="text-xs text-gray-400">موقع الانطلاق</p><p className="text-sm font-medium text-[#091426]">{trip.pickupAddress}</p></div>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${trip.pickupLat},${trip.pickupLng}&travelmode=driving`} target="_blank" rel="noreferrer"
                className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
              ><span className="material-symbols-outlined text-sm">navigation</span>توجيه</a>
            </div>
            <div className="border-r-2 border-dashed border-gray-200 mr-[11px] h-6"></div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 mt-0.5">location_on</span>
              <div className="flex-1"><p className="text-xs text-gray-400">موقع الوصول</p><p className="text-sm font-medium text-[#091426]">{trip.dropoffAddress}</p></div>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${trip.dropoffLat},${trip.dropoffLng}&travelmode=driving`} target="_blank" rel="noreferrer"
                className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shrink-0"
              ><span className="material-symbols-outlined text-sm">navigation</span>توجيه</a>
            </div>
          </div>
        </div>

        {trip.cargoDetails && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-[#091426] mb-2">تفاصيل البضائع</h3>
            <p className="text-sm text-gray-600">{trip.cargoDetails}</p>
            {trip.cargoPhotos && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {trip.cargoPhotos.split(",").map((img, i) => (
                  <div key={i} className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400">📷 صورة {i+1}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {trip.vehicleMakeModel && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-[#091426] mb-2">نوع المركبة</h3>
            <p className="text-sm font-bold text-[#E05A2B]">{trip.vehicleMakeModel}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-[#091426]">تقديم عرض سعر</h3>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center">تم تقديم العرض بنجاح!</div>}
          <div className="relative" dir="ltr">
            <input type="number" className="clear-bid-input w-full h-14 px-3 border border-gray-300 rounded-lg focus:border-[#E05A2B] focus:ring-1 focus:ring-[#E05A2B] text-lg font-bold text-right" placeholder="أدخل قيمة العرض" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <button type="submit" disabled={submitting || success} className="w-full h-14 bg-[#E05A2B] text-white font-bold text-lg rounded-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {submitting ? "جاري التقديم..." : success ? "✓ تم" : "تقديم عرض"}
          </button>
        </form>
      </main>
    </div>
  );
}
