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
  const [arrived, setArrived] = useState(false);

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
          <Link href="/driver/dashboard" className="text-secondary font-bold mt-2 block">العودة</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen bg-background overflow-hidden">
      {/* Full Screen Map */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-surface-variant flex items-center justify-center overflow-hidden">
          <img
            className="w-full h-full object-cover opacity-80"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFAasXXrRfRZpSMAA2fuvV2LWtJ3sV0vuwRQLawkwzMSX8Y3VzCX1zCEgtSclRbMOjQaiSuLl_GV_yfe1tvIjDS1_x19HqFhgQ-kTzx-XPNWSRObUZ-QmHGnvXW4ZjZFzWXnYQqhoClUNQDG0QN94gyztL1iBew0iXTm0QMK_CK-C9JfrIMK_L88uOgIYjD1Q5J-oddS85lUMu_hSZuowLUG4YkSZJrytWl27p1ftSuyySxEz-HH0e1V6_Rc7xQxpOdqLAoa-wh2PE"
            alt="Map"
          />
        </div>
        {/* Map UI Elements */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            <div className="bg-secondary-container p-1 rounded-full shadow-lg border-2 border-white">
              <span className="material-symbols-outlined text-white text-lg">local_shipping</span>
            </div>
          </div>
          <div className="absolute translate-x-32 -translate-y-48">
            <div className="bg-primary p-1 rounded-full shadow-lg border-2 border-white">
              <span className="material-symbols-outlined text-white text-lg">person_pin_circle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Navigation Header */}
      <header className="fixed top-0 left-0 w-full z-20 px-4 pt-4 pb-8 bg-gradient-to-b from-primary/90 to-transparent">
        <div className="max-w-md mx-auto bg-white/95 backdrop-blur-md shadow-lg rounded-xl border border-outline-variant p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-secondary-container/10 p-2 rounded-lg">
              <span className="material-symbols-outlined text-secondary font-bold">navigation</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-primary leading-tight">
                التوجه لنقطة الاستلام
              </h1>
              <p className="text-sm text-on-surface-variant flex items-center gap-1">
                <span>3.2 km</span>
                <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
                <span className="text-secondary font-bold">8 دقائق</span>
              </p>
            </div>
          </div>
          <Link href="/driver/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-primary">close</span>
          </Link>
        </div>
      </header>

      {/* Map Controls */}
      <div className="fixed top-28 left-4 z-10 flex flex-col gap-3">
        <button className="w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center text-primary hover:bg-surface-container-high active:scale-95 transition-all">
          <span className="material-symbols-outlined">my_location</span>
        </button>
        <button className="w-12 h-12 bg-white shadow-md rounded-xl flex items-center justify-center text-primary hover:bg-surface-container-high active:scale-95 transition-all">
          <span className="material-symbols-outlined">layers</span>
        </button>
      </div>

      {/* Arrival FAB */}
      {trip.status === "accepted" && (
        <div className="fixed bottom-[280px] left-4 z-30">
          <button
            onClick={() => { setArrived(true); updateStatus("started"); }}
            className={`group flex items-center gap-3 px-6 py-3 rounded-full shadow-xl active:scale-95 transition-all ${
              arrived ? "bg-primary text-white" : "bg-secondary-container text-white hover:bg-secondary"
            }`}
          >
            <span className="text-lg font-bold">
              {arrived ? "تم الوصول" : "وصلت لنقطة البداية"}
            </span>
            <span className="material-symbols-outlined bg-white/10 p-1 rounded-full">
              {arrived ? "check_circle" : "done_all"}
            </span>
          </button>
        </div>
      )}

      {/* Complete Trip FAB */}
      {trip.status === "started" && (
        <div className="fixed bottom-[280px] left-4 z-30">
          <button
            onClick={() => updateStatus("completed")}
            className="flex items-center gap-3 px-6 py-3 rounded-full shadow-xl active:scale-95 transition-all bg-green-600 text-white"
          >
            <span className="text-lg font-bold">إتمام الرحلة</span>
            <span className="material-symbols-outlined bg-white/10 p-1 rounded-full">flag</span>
          </button>
        </div>
      )}

      {/* Bottom Sheet */}
      <section className="fixed bottom-0 left-0 w-full z-40 bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-outline-variant">
        <div className="w-full flex justify-center py-3">
          <div className="w-12 h-1.5 bg-outline-variant rounded-full"></div>
        </div>
        <div className="max-w-md mx-auto px-6 pb-8 pt-2">
          {/* Customer Info */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center border-2 border-secondary-container shadow-sm">
                  <span className="material-symbols-outlined text-white text-3xl">person</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-tertiary-fixed-dim p-1 rounded-full border-2 border-white">
                  <span className="material-symbols-outlined text-sm text-tertiary">star</span>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-primary">
                  {trip.customer?.name || "العميل"}
                </h2>
                <div className="flex items-center gap-1 text-on-surface-variant text-xs">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>الاستلام في غضون 5 دقائق</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${trip.customer?.phone || ""}`}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-container-high text-primary hover:bg-secondary-container hover:text-white transition-all"
              >
                <span className="material-symbols-outlined">call</span>
              </a>
              <button className="w-12 h-12 flex items-center justify-center rounded-xl bg-surface-container-high text-primary hover:bg-secondary-container hover:text-white transition-all">
                <span className="material-symbols-outlined">chat</span>
              </button>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
              <p className="text-on-surface-variant text-xs mb-1">رقم الشحنة</p>
              <p className="text-sm text-primary font-bold">#{trip.id.slice(-8).toUpperCase()}</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30">
              <p className="text-on-surface-variant text-xs mb-1">نوع الخدمة</p>
              <p className="text-sm text-primary font-bold">{SERVICE_LABELS[trip.serviceType]}</p>
            </div>
          </div>

          {/* Price */}
          {trip.agreedPrice && (
            <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/30 text-center mb-4">
              <p className="text-xs text-on-surface-variant mb-1">السعر المتفق عليه</p>
              <p className="text-2xl font-bold text-primary">{trip.agreedPrice.toFixed(2)} LYD</p>
            </div>
          )}

          {/* Address */}
          <div className="flex items-start gap-4 p-4 bg-secondary-container/5 rounded-2xl border border-secondary-container/20">
            <span className="material-symbols-outlined text-secondary mt-1">location_on</span>
            <div>
              <p className="text-xs text-secondary font-bold mb-1">نقطة الاستلام</p>
              <p className="text-base text-primary">{trip.pickupAddress}</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 mt-2">
            <span className="material-symbols-outlined text-primary mt-1">flag</span>
            <div>
              <p className="text-xs text-primary font-bold mb-1">وجهة الوصول</p>
              <p className="text-base text-on-surface">{trip.dropoffAddress}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
