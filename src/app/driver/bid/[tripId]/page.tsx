"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";

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
  const [bidStatus, setBidStatus] = useState<"pending" | "accepted" | "rejected" | "expired" | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [redirectIn, setRedirectIn] = useState<number | null>(null);
  const timerStarted = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const [tripRes, bidsRes] = await Promise.all([
          fetch(`/api/driver/trips/${tripId}`),
          fetch(`/api/trips/${tripId}/bids`),
        ]);
        if (!tripRes.ok) { setError("الرحلة غير موجودة"); setLoading(false); return; }
        const tripData = (await tripRes.json()).trip;
        setTrip(tripData);
        if (tripData.status === "accepted") {
          if (bidsRes.ok) {
            const bidsData = await bidsRes.json();
            const myAccepted = (bidsData.bids || []).find((b: any) => b.status === "accepted");
            if (myAccepted) { setBidStatus("accepted"); setStatusMessage("تم قبول عرضك! جاري التحويل..."); setTimeout(() => router.push(`/driver/trip/${tripId}`), 1500); }
            else { setBidStatus("expired"); setStatusMessage("تم قبول عرض سائق آخر لهذه الرحلة"); }
          }
        } else if (tripData.status !== "pending") {
          setBidStatus("expired"); setStatusMessage("الرحلة لم تعد متاحة");
        } else if (bidsRes.ok) {
          const bidsData = await bidsRes.json();
          const myPendingBid = (bidsData.bids || []).find((b: any) => b.status === "pending");
          if (myPendingBid) { setBidStatus("pending"); setStatusMessage("تم تقديم عرضك - في انتظار موافقة الزبون"); }
        }
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
      if (res.ok) { setSuccess(true); setBidStatus("pending"); setStatusMessage("تم تقديم عرضك - في انتظار موافقة الزبون"); }
      else setError(data.error || "فشل التقديم");
    } catch { setError("تعذر الاتصال"); }
    setSubmitting(false);
  }

  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const r = await fetch(`/api/driver/trips/${tripId}`);
        if (!r.ok) return;
        const d = await r.json();
        const t = d.trip;
        if (t.status === "accepted") {
          const bidRes = await fetch(`/api/trips/${tripId}/bids`);
          if (bidRes.ok) {
            const bd = await bidRes.json();
            const mine = (bd.bids || []).find((b: any) => b.status === "accepted");
            if (mine) { setBidStatus("accepted"); setStatusMessage("تم قبول عرضك! جاري التحويل..."); setTimeout(() => router.push(`/driver/trip/${tripId}`), 1500); }
            else {
              setBidStatus("expired");
              const acceptedAt = t.acceptedAt ? new Date(t.acceptedAt).getTime() : Date.now();
              const elapsed = Date.now() - acceptedAt;
              const remaining = Math.max(0, Math.ceil((5 * 60 * 1000 - elapsed) / 1000));
              setRedirectIn(remaining);
              setStatusMessage(`تم قبول عرض سائق آخر لهذه الرحلة (سيتم إخفاؤها بعد ${remaining} ثانية)`);
            }
            clearInterval(iv);
          }
        } else if (t.status !== "pending") {
          setBidStatus("expired"); setStatusMessage("الرحلة لم تعد متاحة");
          clearInterval(iv);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(iv);
  }, [tripId]);

  useEffect(() => {
    if (redirectIn === null || timerStarted.current) return;
    timerStarted.current = true;
    const redirectAt = Date.now() + redirectIn * 1000;
    const display = setInterval(() => {
      const left = Math.max(0, Math.ceil((redirectAt - Date.now()) / 1000));
      const m = Math.floor(left / 60);
      const s = left % 60;
      setStatusMessage(`تم قبول عرض سائق آخر لهذه الرحلة (سيتم إخفاؤها بعد ${m}:${s.toString().padStart(2, "0")})`);
      if (left <= 0) { clearInterval(display); clearTimeout(redir); }
    }, 1000);
    const redir = setTimeout(() => { router.push("/driver/dashboard"); }, redirectIn * 1000);
    return () => { clearInterval(display); clearTimeout(redir); };
  }, [redirectIn]);

  if (loading) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center text-gray-400">جاري التحميل...</div>;
  if (!trip || error) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center"><div className="text-center"><span className="material-symbols-outlined text-6xl text-gray-300">error</span><p className="mt-4 text-gray-500">{error || "غير موجود"}</p><Link href="/driver/dashboard" className="text-[#E05A2B] font-bold mt-2 block">العودة</Link></div></div>;

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col">
      <style>{`.clear-bid-input::-webkit-outer-spin-button,.clear-bid-input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.clear-bid-input{-moz-appearance:textfield}`}</style>
      <Header title="تفاصيل الطلب" backHref="/driver/dashboard" />

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
            </div>
            <div className="border-r-2 border-dashed border-gray-200 mr-[11px] h-6"></div>
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-red-500 mt-0.5">location_on</span>
              <div className="flex-1"><p className="text-xs text-gray-400">موقع الوصول</p><p className="text-sm font-medium text-[#091426]">{trip.dropoffAddress}</p></div>
            </div>
          </div>
        </div>

        {trip.cargoDetails && (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-[#091426] mb-2">تفاصيل البضائع</h3>
            <p className="text-sm text-gray-600">{trip.cargoDetails}</p>
            {trip.cargoPhotos && trip.cargoPhotos.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {trip.cargoPhotos.split(",").filter(Boolean).map((img, i) => (
                  <img key={i} src={`/uploads/${img.trim()}`} alt={`صورة ${i+1}`}
                    className="w-24 h-24 rounded-lg object-cover border border-gray-200 bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setPreviewImage(`/uploads/${img.trim()}`)}
                  />
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

        {bidStatus ? (
          <div className={`p-4 rounded-xl text-center font-bold ${
            bidStatus === "pending" ? "bg-yellow-50 text-yellow-700" :
            bidStatus === "accepted" ? "bg-green-50 text-green-700" :
            "bg-red-50 text-red-700"
          }`}>
            <p className="text-lg">{statusMessage}</p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-bold text-[#091426]">تقديم عرض سعر</h3>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm text-center">تم تقديم العرض بنجاح!</div>}
          <div className="relative" dir="ltr">
            <input type="number" className="clear-bid-input w-full h-14 px-3 border border-gray-300 rounded-lg focus:border-[#E05A2B] focus:ring-1 focus:ring-[#E05A2B] text-lg font-bold text-right" placeholder="أدخل قيمة العرض" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
          <button type="submit" disabled={submitting || success}
            style={{width:"100%",height:"56px",backgroundColor: submitting||success ? "#9ca3af" : "#E05A2B",color:"white",fontWeight:"bold",fontSize:"18px",borderRadius:"8px",border:"none",cursor: submitting||success ? "not-allowed" : "pointer"}}>
            {submitting ? "جاري التقديم..." : success ? "✓ تم" : "تقديم عرض"}
          </button>
        </form>
        )}
      </main>

      {previewImage && (
        <div onClick={() => setPreviewImage(null)} style={{position:"fixed",inset:0,zIndex:9999,backgroundColor:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <button onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }} style={{position:"absolute",top:"16px",right:"16px",background:"white",border:"none",borderRadius:"50%",width:"40px",height:"40px",fontSize:"20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1}}>✕</button>
          <img src={previewImage} alt="معاينة" style={{maxWidth:"90%",maxHeight:"90%",objectFit:"contain",borderRadius:"8px"}} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
