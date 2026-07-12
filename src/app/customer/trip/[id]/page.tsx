"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/use-socket";
import { useToast } from "@/hooks/use-toast";

interface TripData {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  agreedPrice: number;
  driver?: {
    id: string;
    user: { name: string; phone: string };
    rating: number;
    totalTrips: number;
  } | null;
}

const SERVICE_LABELS: Record<string, string> = {
  car: "سيارة خاصة",
  porter: "بورتر",
  tow_truck: "ساحبة",
};

export default function CustomerTripPage() {
  const params = useParams();
  const tripId = params?.id as string;
  const { socket } = useSocket();
  const { toast } = useToast();
  const [trip, setTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState(12);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/trips/${tripId}`);
        if (res.ok) {
          const data = await res.json();
          setTrip(data.trip);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, [tripId]);

  useEffect(() => {
    if (socket && tripId) {
      socket.emit("trip:join", tripId);
      socket.on("location:changed", (data: { lat: number; lng: number }) => {
        setEta((prev) => Math.max(1, prev - 1));
      });
    }
    return () => {
      if (socket) {
        socket.emit("trip:leave", tripId);
        socket.off("location:changed");
      }
    };
  }, [socket, tripId]);

  useEffect(() => {
    if (eta > 0 && trip?.status === "accepted") {
      const interval = setInterval(() => setEta((prev) => Math.max(1, prev - 1)), 30000);
      return () => clearInterval(interval);
    }
  }, [eta, trip?.status]);

  async function submitReview() {
    if (!rating) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, rating, comment }),
      });
      if (res.ok) {
        setReviewed(true);
        toast("تم إرسال التقييم بنجاح", "success");
      }
    } catch {}
    setSubmittingReview(false);
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-on-surface-variant">جاري التحميل...</div>;
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-outline">error</span>
          <p className="mt-4">الرحلة غير موجودة</p>
          <Link href="/customer/dashboard" className="text-secondary font-bold mt-2 block">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  if (trip.status === "completed") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-outline-variant rounded-2xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2">تمت الرحلة بنجاح</h2>
          <p className="text-on-surface-variant mb-2">السعر: {trip.agreedPrice?.toFixed(2)} LYD</p>
          <p className="text-sm text-on-surface-variant mb-6">{trip.pickupAddress} ← {trip.dropoffAddress}</p>

          {!reviewed ? (
            <div className="space-y-4">
              <h3 className="font-bold text-primary">تقييم السائق</h3>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="text-3xl transition-transform active:scale-110">
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>
              <textarea
                className="w-full px-3 py-2 border border-outline-variant rounded-lg text-sm resize-none"
                rows={2}
                placeholder="تعليق (اختياري)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                onClick={submitReview}
                disabled={submittingReview || !rating}
                className="w-full bg-secondary-container text-white font-bold py-3 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50"
              >
                {submittingReview ? "جاري الإرسال..." : "إرسال التقييم"}
              </button>
            </div>
          ) : (
            <div className="text-green-600 font-bold">تم إرسال تقييمك ✓</div>
          )}

          <Link href="/customer/dashboard" className="block mt-6 text-secondary font-bold hover:underline">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-background">
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-surface-variant flex items-center justify-center">
          <span className="material-symbols-outlined text-8xl text-outline opacity-30">map</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-background/40 pointer-events-none"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 p-4">
        <div className="max-w-xl mx-auto flex flex-row-reverse items-center justify-between bg-white/90 backdrop-blur-md border border-outline-variant/50 px-4 h-16 rounded-xl shadow-lg">
          <Link href="/customer/dashboard" className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-low">
            <span className="material-symbols-outlined text-primary text-2xl">arrow_forward</span>
          </Link>
          <div className="flex flex-col items-end">
            <h1 className="text-lg font-semibold text-primary">تتبع مباشر</h1>
            <span className="text-xs text-on-surface-variant">طلب #{trip.id.slice(-8)}</span>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="relative z-10 w-full h-full pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="bg-secondary px-3 py-1 rounded-lg shadow-lg mb-1">
            <p className="text-white text-sm font-medium">{eta} دقيقة</p>
          </div>
          <span className="material-symbols-outlined text-secondary text-5xl">location_on</span>
        </div>
      </main>

      <section className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4">
        <div className="max-w-xl mx-auto bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-6 border border-outline-variant/50">
          <div className="w-12 h-1 bg-outline-variant rounded-full mx-auto mb-6"></div>
          <div className="mb-6">
            <div className="flex justify-between items-end mb-3">
              <div className="flex flex-col">
                <span className="text-on-surface-variant text-sm">الوصول المتوقع</span>
                <h2 className="text-primary text-3xl font-bold">{eta} دقيقة</h2>
              </div>
              <div className="bg-surface-container text-secondary text-sm font-medium px-3 py-1 rounded-full">
                {trip.status === "started" ? "جاري التوصيل" : "في الطريق"}
              </div>
            </div>
            <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-2/3 rounded-full transition-all" style={{ width: `${Math.max(10, 100 - eta * 8)}%` }}></div>
            </div>
          </div>

          {trip.driver && (
            <div className="flex flex-row-reverse items-center justify-between bg-surface-container-lowest border border-outline-variant p-4 rounded-lg mb-6">
              <div className="flex flex-row-reverse items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl">person</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    <span className="material-symbols-outlined text-xs">star</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <h3 className="font-semibold text-primary">{trip.driver.user.name}</h3>
                  <span className="text-on-surface-variant text-xs">{trip.driver.rating?.toFixed(1)} ({trip.driver.totalTrips}+)</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-primary-container text-3xl">local_shipping</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <a href={`tel:${trip.driver?.user?.phone || ""}`} className="bg-secondary text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span>اتصال</span>
              <span className="material-symbols-outlined">call</span>
            </a>
            <button className="bg-white border-2 border-primary text-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all">
              <span>رسالة</span>
              <span className="material-symbols-outlined">chat_bubble</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
