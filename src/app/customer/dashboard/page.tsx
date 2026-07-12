"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Trip {
  id: string;
  serviceType: string;
  pickupAddress: string;
  dropoffAddress: string;
  status: string;
  createdAt: string;
}

export default function CustomerDashboardPage() {
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await fetch("/api/trips?status=active");
        if (res.ok) {
          const data = await res.json();
          setActiveTrip(data.activeTrip || null);
        }
      } catch {}
      setLoading(false);
    }
    fetchTrips();
  }, []);

  const SERVICE_LABELS: Record<string, string> = {
    car: "سيارة خاصة",
    porter: "بورتر",
    tow_truck: "ساحبة",
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="bg-surface sticky top-0 z-50 border-b border-outline-variant flex flex-row-reverse justify-between items-center w-full px-4 h-16">
        <div className="flex items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined text-on-surface-variant p-2 rounded-full hover:bg-surface-container-low transition-colors cursor-pointer">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-surface"></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden shadow-sm">
              <div className="w-full h-full bg-primary-container flex items-center justify-center text-white font-bold">
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>
            <p className="text-sm font-medium text-on-surface hidden md:block">مرحباً</p>
          </div>
        </div>
        <h1 className="text-xl font-bold text-secondary">B2B Driver</h1>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {activeTrip && (
          <section>
            <h2 className="text-xl font-semibold text-primary mb-4">الطلب الحالي</h2>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-md flex flex-col md:flex-row">
              <div className="md:w-2/3 h-48 md:h-64 relative">
                <div className="w-full h-full bg-surface-variant flex items-center justify-center">
                  <span className="material-symbols-outlined text-6xl text-outline">map</span>
                </div>
                <div className="absolute bottom-4 right-4 bg-surface px-3 py-1 rounded-lg shadow-lg flex items-center gap-2">
                  <span className="w-3 h-3 bg-secondary rounded-full animate-pulse"></span>
                  <p className="text-sm text-on-surface">
                    {activeTrip.status === "accepted" ? "السائق في الطريق" : "بانتظار العروض"}
                  </p>
                </div>
              </div>
              <div className="md:w-1/3 p-6 flex flex-col justify-between bg-primary-container text-white">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-on-primary-container mb-1">رقم الطلب</p>
                      <p className="text-xl font-bold">#{activeTrip.id.slice(-8)}</p>
                    </div>
                    <span className="bg-secondary px-2 py-1 rounded-full text-xs font-bold">
                      {activeTrip.status === "accepted" ? "نشط" : "معلق"}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary-container text-lg">
                        local_shipping
                      </span>
                      <span className="text-sm">{SERVICE_LABELS[activeTrip.serviceType] || activeTrip.serviceType}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary-container text-lg">
                        schedule
                      </span>
                      <span className="text-sm">بانتظار الموافقة</span>
                    </div>
                  </div>
                </div>
                <Link
                  href={`/customer/trip/${activeTrip.id}`}
                  className="w-full bg-secondary text-white font-bold py-3 rounded-lg text-center active:scale-95 transition-transform hover:opacity-90 mt-4 block"
                >
                  تتبع الطلب بالتفصيل
                </Link>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xl font-semibold text-primary mb-4">طلب خدمة جديدة</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/customer/request?type=car"
              className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary-container transition-colors">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-white">
                  directions_car
                </span>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-1">سيارة خاصة</h3>
              <p className="text-sm text-on-surface-variant">
                خدمة التوصيل السريع للطرود الصغيرة والمستندات الهامة داخل المدينة.
              </p>
            </Link>

            <Link
              href="/customer/request?type=porter"
              className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary-container transition-colors">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-white">
                  local_shipping
                </span>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-1">بورتر</h3>
              <p className="text-sm text-on-surface-variant">
                حلول نقل شاملة للشحنات المتوسطة والكبيرة بأمان تام.
              </p>
            </Link>

            <Link
              href="/customer/request?type=tow_truck"
              className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl hover:shadow-lg transition-all group"
            >
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mb-4 group-hover:bg-secondary-container transition-colors">
                <span className="material-symbols-outlined text-3xl text-secondary group-hover:text-white">
                  precision_manufacturing
                </span>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-1">ساحبة</h3>
              <p className="text-sm text-on-surface-variant">
                خدمة سحب المركبات المعطلة على مدار الساعة.
              </p>
            </Link>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-primary">العروض المقدمة</h2>
            <Link href="/customer/bids" className="text-secondary text-sm font-medium hover:underline">
              عرض الكل
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-on-surface-variant">جاري التحميل...</div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant p-12 rounded-xl text-center">
              <span className="material-symbols-outlined text-6xl text-outline">move_to_inbox</span>
              <h3 className="text-lg font-semibold text-primary mt-4 mb-2">
                لا توجد عروض حالياً
              </h3>
              <p className="text-sm text-on-surface-variant max-w-sm mx-auto">
                سيظهر السائقون المهتمون بشحنتك هنا فور تقديم عروضهم.
              </p>
            </div>
          )}
        </section>
      </main>

      <nav className="bg-surface-container-lowest border-t border-outline-variant fixed bottom-0 w-full z-50 shadow-md flex flex-row-reverse justify-around items-center py-2">
        <a className="flex flex-col items-center justify-center text-secondary font-bold scale-110" href="/customer/dashboard">
          <span className="material-symbols-outlined">home</span>
          <span className="text-xs">الرئيسية</span>
        </a>
        <Link href="/customer/request" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary-container transition-all">
          <span className="material-symbols-outlined">local_shipping</span>
          <span className="text-xs">الشحنات</span>
        </Link>
        <Link href="/customer/bids" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary-container transition-all relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="text-xs">التنبيهات</span>
        </Link>
        <Link href="/login" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-secondary-container transition-all">
          <span className="material-symbols-outlined">person</span>
          <span className="text-xs">الحساب</span>
        </Link>
      </nav>
    </div>
  );
}
