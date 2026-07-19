"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface DriverTrip {
  id: string; serviceType: string;
  pickupAddress: string; pickupLat: number; pickupLng: number;
  dropoffAddress: string; dropoffLat: number; dropoffLng: number;
  cargoDetails: string | null; vehicleMakeModel: string | null;
  status: string; agreedPrice: number; customer: { name: string; phone: string };
}

export default function DriverTripPage() {
  const params = useParams(); const router = useRouter();
  const tripId = params?.id as string;
  const [trip, setTrip] = useState<DriverTrip | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    (async () => { try { const r = await fetch(`/api/driver/trips/${tripId}`); if (r.ok) setTrip((await r.json()).trip); } catch {}; setLoading(false); })();
  }, [tripId]);

  useEffect(() => {
    if (!trip || trip.status === "completed" || trip.status === "pending") return;
    let watchId: number;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            await fetch(`/api/driver/location`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ tripId, lat: latitude, lng: longitude }),
            });
          } catch {}
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [trip?.status, tripId]);

  async function updateStatus(status: string) {
    setUpdating(true);
    try {
      const r = await fetch(`/api/trips/${tripId}/status`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (r.ok && trip) {
        if (status === "completed") { setCompleted(true); setTimeout(() => router.push("/driver/dashboard"), 2000); }
        else setTrip({ ...trip, status });
      }
    } catch {}
    setUpdating(false);
  }

  function navigateTo(lat: number, lng: number) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`, "_blank");
  }

  if (loading) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center text-gray-400">جاري التحميل...</div>;
  if (!trip) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center"><Link href="/driver/dashboard" className="text-[#E05A2B] font-bold">العودة</Link></div>;
  if (completed) return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-sm">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4"><span className="text-5xl">✅</span></div>
        <h2 className="text-2xl font-bold text-[#091426] mb-2">الرحلة انتهت بنجاح</h2>
        <p className="text-gray-500 mb-2">{trip.agreedPrice?.toFixed(2)} LYD</p>
        <p className="text-sm text-gray-400">{trip.pickupAddress} → {trip.dropoffAddress}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <header className="bg-white sticky top-0 z-40 border-b border-gray-200 flex flex-row-reverse items-center px-4 h-16">
        <Link href="/driver/dashboard" className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">arrow_forward</span></Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">الرحلة النشطة</h1>
      </header>

      <main className="flex-grow p-4 max-w-lg mx-auto w-full space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
              {trip.status === "accepted" ? "في الطريق للاستلام" : trip.status === "started" ? "جاري التوصيل" : trip.status}
            </span>
            <span className="text-xs text-gray-400">#{trip.id.slice(-8)}</span>
          </div>
          <div className="text-center py-4 bg-gray-50 rounded-lg mb-4">{trip.agreedPrice && <p className="text-3xl font-bold text-[#E05A2B]">{trip.agreedPrice.toFixed(2)} <span className="text-sm text-gray-400">LYD</span></p>}</div>
          <div className="space-y-3">
            <div className="flex items-start gap-2"><span className="text-green-500 mt-0.5">📍</span><div><p className="text-xs text-gray-400">الانطلاق</p><p className="text-sm font-medium">{trip.pickupAddress}</p></div></div>
            <div className="flex items-start gap-2"><span className="text-red-500 mt-0.5">📍</span><div><p className="text-xs text-gray-400">الوصول</p><p className="text-sm font-medium">{trip.dropoffAddress}</p></div></div>
          </div>
        </div>

        {trip.customer && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"><span className="text-lg">👤</span></div>
                <div><p className="font-bold text-sm">{trip.customer.name}</p><p className="text-xs text-gray-500">{trip.customer.phone}</p></div>
              </div>
            </div>
            <div className="flex gap-2">
              <a href={`/driver/chat/${tripId}`} className="flex-1 bg-[#E05A2B] text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                <span className="material-symbols-outlined">chat</span> رسالة
              </a>
              <a href={`tel:${trip.customer.phone}`} className="flex-1 bg-green-600 text-white py-3 rounded-lg text-sm font-bold flex items-center justify-center gap-1">
                <span className="material-symbols-outlined">call</span> اتصال
              </a>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
          {trip.status === "accepted" && (
            <>
              <button onClick={() => navigateTo(trip.pickupLat || 32.88, trip.pickupLng || 13.19)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">navigation</span> توجيه لموقع الانطلاق
              </button>
              <button onClick={() => updateStatus("started")} disabled={updating}
                className="w-full bg-[#E05A2B] text-white font-bold py-3 rounded-lg">
                {updating ? "جاري..." : "وصلت لموقع الانطلاق"}
              </button>
            </>
          )}

          {trip.status === "started" && (
            <>
              <button onClick={() => navigateTo(trip.dropoffLat || 32.12, trip.dropoffLng || 20.07)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">navigation</span> توجيه لموقع الوصول
              </button>
              <button onClick={() => updateStatus("completed")} disabled={updating}
                className="w-full bg-green-600 text-white font-bold py-3 rounded-lg">
                {updating ? "جاري..." : "وصلت للموقع النهائي (إنهاء الرحلة)"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
