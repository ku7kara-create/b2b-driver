"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const TripMap = dynamic(() => import("@/components/trip-map"), { ssr: false });

interface TripData {
  id: string; serviceType: string;
  pickupAddress: string; pickupLat: number; pickupLng: number;
  dropoffAddress: string; dropoffLat: number; dropoffLng: number;
  status: string; agreedPrice: number;
  driver?: { id: string; user: { name: string; phone: string }; rating: number; totalTrips: number; currentLat?: number; currentLng?: number } | null;
}

export default function CustomerTripPage() {
  const params = useParams(); const tripId = params?.id as string;
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [driverPos, setDriverPos] = useState<[number, number] | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [copied, setCopied] = useState("");

  function copyText(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(label); setTimeout(() => setCopied(""), 1500); }).catch(() => {});
  }

  useEffect(() => {
    (async () => {
      try { const r = await fetch(`/api/trips/${tripId}`); if (r.ok) setTrip((await r.json()).trip); } catch {}
      setLoading(false);
    })();
  }, [tripId]);

  useEffect(() => {
    if (!trip || trip.status === "completed" || trip.status === "pending") return;
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`/api/trips/${tripId}`);
        if (r.ok) {
          const d = await r.json();
          setTrip(d.trip);
          if (d.trip.driver?.currentLat && d.trip.driver?.currentLng) {
            setDriverPos([d.trip.driver.currentLat, d.trip.driver.currentLng]);
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(iv);
  }, [trip?.status, tripId]);

  async function submitReview() {
    if (!rating) return;
    setSubmittingReview(true);
    try { await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tripId, rating, comment }) }); setReviewed(true); } catch {}
    setSubmittingReview(false);
  }

  if (loading) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center text-gray-400">جاري التحميل...</div>;
  if (!trip) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center"><Link href="/customer/dashboard" className="text-[#E05A2B]">العودة</Link></div>;

  if (trip.status === "completed") return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
      <div className="max-w-sm bg-white rounded-2xl p-8 shadow-sm text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"><span className="text-5xl">✓</span></div>
        <h2 className="text-2xl font-bold text-[#091426] mb-2">تمت الرحلة بنجاح</h2>
        <p className="text-gray-500 mb-1">{trip.agreedPrice?.toFixed(2)} LYD</p>
        {!reviewed ? (
          <div className="space-y-3 mt-4">
            <div className="flex justify-center gap-1">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setRating(s)} className="text-3xl">{s <= rating ? "⭐" : "☆"}</button>)}</div>
            <textarea className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="تعليق..." value={comment} onChange={e => setComment(e.target.value)} />
            <button onClick={submitReview} disabled={submittingReview || !rating} className="w-full bg-[#E05A2B] text-white font-bold py-3 rounded-xl">{submittingReview ? "..." : "إرسال"}</button>
          </div>
        ) : <p className="text-green-600 mt-2">✓ تم التقييم</p>}
        <Link href="/customer/dashboard" className="block mt-4 text-[#E05A2B] font-bold">العودة</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 flex flex-row-reverse items-center px-4 h-16">
        <Link href="/customer/dashboard" className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">arrow_forward</span></Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">تتبع الرحلة</h1>
      </header>
      {copied && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-800 text-white px-4 py-2 rounded-full text-sm">✓ تم نسخ {copied}</div>}

      <main className="flex-grow p-4 max-w-lg mx-auto w-full space-y-4">
        {trip.pickupLat && trip.dropoffLat ? (
          <TripMap pickup={[trip.pickupLat, trip.pickupLng]} dropoff={[trip.dropoffLat, trip.dropoffLng]} />
        ) : (
          <div className="h-64 bg-gray-100 rounded-xl flex items-center justify-center"><span className="text-gray-400">الخريطة غير متوفرة</span></div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">الحالة</span>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              {trip.status === "accepted" ? "في الطريق" : trip.status === "started" ? "جاري التوصيل" : trip.status}
            </span>
          </div>
          {trip.agreedPrice && <p className="text-2xl font-bold text-[#E05A2B] text-center my-3">{trip.agreedPrice.toFixed(2)} LYD</p>}
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2 cursor-pointer" onClick={() => copyText(trip.pickupAddress, "العنوان")}><span className="text-green-500 mt-0.5">📍</span><span className="flex-1">{trip.pickupAddress}</span><span className="material-symbols-outlined text-gray-300 text-sm">content_copy</span></div>
            <div className="flex items-start gap-2 cursor-pointer" onClick={() => copyText(trip.dropoffAddress, "العنوان")}><span className="text-red-500 mt-0.5">📍</span><span className="flex-1">{trip.dropoffAddress}</span><span className="material-symbols-outlined text-gray-300 text-sm">content_copy</span></div>
          </div>
        </div>

        {trip.driver && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#1e293b] flex items-center justify-center text-white"><span className="material-symbols-outlined">person</span></div>
                <div><h3 className="font-bold">{trip.driver.user.name}</h3><p className="text-xs text-gray-500 cursor-pointer" onClick={() => copyText(trip.driver!.user.phone, "الهاتف")}>📋 {trip.driver.rating?.toFixed(1)}</p></div>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`tel:${trip.driver.user.phone}`} className="flex-1 bg-green-600 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-lg">call</span> اتصال
              </a>
              <a href={`https://wa.me/${trip.driver.user.phone?.replace('+','')}`} target="_blank" rel="noreferrer" className="flex-1 bg-green-500 text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-lg">chat</span> واتساب
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
