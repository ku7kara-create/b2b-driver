"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Trip {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  agreedPrice: number;
  createdAt: string;
  driver?: { user: { name: string }; rating: number } | null;
}

export default function CustomerDashboardPage() {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const activeRes = await fetch("/api/trips?status=active");
        if (activeRes.ok) {
          const data = await activeRes.json();
          setActiveTrip(data.activeTrip || null);
        }

        const allRes = await fetch("/api/trips");
        if (allRes.ok) {
          const data = await allRes.json();
          setRecentTrips((data.trips || []).slice(0, 5));
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const SERVICE_LABELS: Record<string, string> = {
    car: "سيارة خاصة", porter: "بورتر", tow_truck: "ساحبة",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant flex flex-row-reverse justify-between items-center w-full px-4 h-16">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
            <span className="material-symbols-outlined">person</span>
          </div>
          <p className="text-sm font-medium text-on-surface">مرحباً</p>
        </div>
        <h1 className="text-xl font-bold text-secondary">B2B Driver</h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {activeTrip && (
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">الطلب الحالي</h2>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row">
              <div className="md:w-2/3 h-48 md:h-64 relative bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-outline">map</span>
                <div className="absolute bottom-4 right-4 bg-surface px-3 py-1 rounded-lg shadow-lg flex items-center gap-2">
                  <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
                  <p className="text-sm">{activeTrip.status === "accepted" ? "السائق في الطريق" : "بانتظار العروض"}</p>
                </div>
              </div>
              <div className="md:w-1/3 p-6 flex flex-col justify-between bg-primary-container text-white">
                <div>
                  <div className="flex justify-between items-start">
                    <div><p className="text-xs text-on-primary-container mb-1">رقم الطلب</p><p className="text-xl font-bold">#{activeTrip.id.slice(-8)}</p></div>
                    <span className="bg-secondary px-2 py-1 rounded-full text-xs font-bold">{activeTrip.status === "accepted" ? "نشط" : "معلق"}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary-container text-lg">local_shipping</span><span className="text-sm">{SERVICE_LABELS[activeTrip.serviceType]}</span></div>
                    <div className="flex items-center gap-2"><span className="material-symbols-outlined text-secondary-container text-lg">schedule</span><span className="text-sm">{activeTrip.status === "accepted" ? "قيد التنفيذ" : "بانتظار العروض"}</span></div>
                  </div>
                </div>
                <Link href={activeTrip.status === "completed" ? `/customer/trip/${activeTrip.id}` : activeTrip.status === "accepted" ? `/customer/trip/${activeTrip.id}` : `/customer/bids/${activeTrip.id}`} className="w-full bg-secondary text-white font-bold py-3 rounded-lg text-center block mt-4">
                  {activeTrip.status === "accepted" ? "تتبع" : "عرض العروض"}
                </Link>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold text-primary mb-4">طلب خدمة جديدة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { type: "car", label: "سيارة خاصة", icon: "directions_car", desc: "توصيل سريع للطرود والمستندات." },
              { type: "porter", label: "بورتر", icon: "local_shipping", desc: "نقل شحنات متوسطة وكبيرة بأمان." },
              { type: "tow_truck", label: "ساحبة", icon: "precision_manufacturing", desc: "سحب مركبات معطلة 24/7." },
            ].map((svc) => (
              <Link key={svc.type} href={`/customer/request?type=${svc.type}`} className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl hover:shadow-lg transition-all group">
                <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary-container transition-colors">
                  <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-white">{svc.icon}</span>
                </div>
                <h3 className="text-lg font-semibold text-primary mb-1">{svc.label}</h3>
                <p className="text-sm text-on-surface-variant">{svc.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        {recentTrips.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">آخر الرحلات</h2>
              <Link href="/customer/bids" className="text-secondary text-sm font-medium hover:underline">عرض الكل</Link>
            </div>
            <div className="space-y-2">
              {recentTrips.map((trip) => (
                <Link key={trip.id} href={`/customer/trip/${trip.id}`} className="bg-white border border-outline-variant rounded-lg p-4 flex justify-between items-center hover:border-secondary transition-colors block">
                  <div>
                    <h3 className="font-bold text-primary">{SERVICE_LABELS[trip.serviceType]}</h3>
                    <p className="text-sm text-on-surface-variant">{trip.pickupAddress}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${trip.status === "completed" ? "bg-green-100 text-green-700" : trip.status === "accepted" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {trip.status === "completed" ? "مكتمل" : trip.status === "accepted" ? "نشط" : "معلق"}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <nav className="bg-surface-container-lowest border-t border-outline-variant fixed bottom-0 w-full z-50 shadow-md flex flex-row-reverse justify-around items-center py-2">
        {[
          { href: "/customer/dashboard", icon: "home", label: "الرئيسية", active: true },
          { href: "/customer/bids", icon: "local_shipping", label: "الطلبات" },
          { href: "/customer/request", icon: "add_circle", label: "طلب جديد" },
          { href: "/login", icon: "person", label: "الحساب" },
        ].map((item) => (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-colors ${item.active ? "text-secondary font-bold" : "text-on-surface-variant hover:text-secondary-container"}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
