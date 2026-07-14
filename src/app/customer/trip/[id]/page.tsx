"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface TripData {
  id: string; serviceType: string; pickupAddress: string; dropoffAddress: string;
  status: string; agreedPrice: number;
  driver?: { user: { name: string; phone: string }; rating: number; totalTrips: number } | null;
  customer?: { name: string; phone: string } | null;
}

const SERVICE_LABELS: Record<string, string> = { car: "سيارة خاصة", porter: "بورتر", tow_truck: "ساحبة" };

export default function CustomerTripPage() {
  const params = useParams(); const tripId = params?.id as string;
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        if (res.ok) setTrip((await res.json()).trip);
      } catch {}
      setLoading(false);
    })();
  }, [tripId]);

  async function submitReview() {
    if (!rating) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tripId, rating, comment }) });
      if (res.ok) setReviewed(true);
    } catch {}
    setSubmittingReview(false);
  }

  if (loading) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center text-gray-400">جاري التحميل...</div>;
  if (!trip) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center"><div className="text-center"><span className="material-symbols-outlined text-6xl text-gray-300">error</span><p className="mt-4 text-gray-500">الرحلة غير موجودة</p><Link href="/customer/dashboard" className="text-[#E05A2B] font-bold mt-2 block">العودة</Link></div></div>;

  if (trip.status === "completed") {
    return (
      <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
        <div className="max-w-sm w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"><span className="text-5xl text-green-600">✓</span></div>
          <h2 className="text-2xl font-bold text-[#091426] mb-2">تمت الرحلة بنجاح</h2>
          <p className="text-gray-500 mb-1">{trip.agreedPrice?.toFixed(2)} LYD</p>
          <p className="text-sm text-gray-400 mb-6">{trip.pickupAddress} ← {trip.dropoffAddress}</p>
          {!reviewed ? (
            <div className="space-y-3">
              <h3 className="font-bold text-[#091426]">تقييم السائق</h3>
              <div className="flex justify-center gap-1">{[1,2,3,4,5].map((s) => <button key={s} onClick={() => setRating(s)} className="text-3xl">{s <= rating ? "⭐" : "☆"}</button>)}</div>
              <textarea className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" rows={2} placeholder="تعليق (اختياري)..." value={comment} onChange={(e) => setComment(e.target.value)} />
              <button onClick={submitReview} disabled={submittingReview || !rating} className="w-full bg-[#E05A2B] text-white font-bold py-3 rounded-xl disabled:opacity-50">{submittingReview ? "جاري..." : "إرسال التقييم"}</button>
            </div>
          ) : <div className="text-green-600 font-bold">تم إرسال تقييمك ✓</div>}
          <Link href="/customer/dashboard" className="block mt-6 text-[#E05A2B] font-bold">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 flex flex-row-reverse items-center w-full px-4 h-16">
        <Link href="/customer/dashboard" className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">arrow_forward</span></Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">تتبع الرحلة</h1>
      </header>

      <main className="flex-grow p-4 max-w-lg mx-auto w-full space-y-4">
        <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center"><span className="material-symbols-outlined text-6xl text-gray-300">map</span></div>

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-500">الحالة</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{trip.status === "accepted" ? "قيد التنفيذ" : trip.status === "started" ? "جاري" : "معلق"}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2"><span className="material-symbols-outlined text-green-500 mt-0.5">trip_origin</span><span className="text-[#091426]">{trip.pickupAddress}</span></div>
            <div className="flex items-start gap-2"><span className="material-symbols-outlined text-red-500 mt-0.5">location_on</span><span className="text-[#091426]">{trip.dropoffAddress}</span></div>
          </div>
          {trip.agreedPrice && <p className="mt-3 text-center text-2xl font-bold text-[#E05A2B]">{trip.agreedPrice.toFixed(2)} LYD</p>}
        </div>

        {trip.driver && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#1e293b] flex items-center justify-center text-white"><span className="material-symbols-outlined">person</span></div>
              <div><h3 className="font-bold text-[#091426]">{trip.driver.user.name}</h3><p className="text-xs text-gray-500">⭐ {trip.driver.rating?.toFixed(1)} ({trip.driver.totalTrips}+)</p></div>
            </div>
            <a href={`tel:${trip.driver.user.phone}`} className="bg-[#E05A2B] text-white px-4 py-2 rounded-lg text-sm font-bold">اتصال</a>
          </div>
        )}
      </main>
    </div>
  );
}
