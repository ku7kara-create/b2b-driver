"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";

const VEHICLE_LABELS: Record<string, string> = {
  car: "سيارة خاصة", porter: "بورتر وكنتر", tow_truck: "ساحبة", truck: "بورتر وكنتر", bike: "دراجة",
};

export default function DriverProfilePage() {
  const { data: session } = useSession();
  const [sub, setSub] = useState<{ subscriptionStatus: string; subscriptionExpiry: string | null } | null>(null);
  const [vehicle, setVehicle] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, vRes] = await Promise.all([
          fetch("/api/driver/subscription"),
          fetch("/api/driver/vehicles"),
        ]);
        if (sRes.ok) setSub(await sRes.json());
        if (vRes.ok) { const d = await vRes.json(); setVehicle(d.type || null); }
      } catch {}
    })();
  }, []);

  function getDaysRemaining(expiry: string | null): number | null {
    if (!expiry) return null;
    return Math.ceil((new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
  const days = getDaysRemaining(sub?.subscriptionExpiry || null);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200 flex flex-row-reverse items-center px-4 h-16">
        <Link href="/driver/dashboard" className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">arrow_forward</span></Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">حسابي</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto mb-4"><span className="material-symbols-outlined text-white text-4xl">person</span></div>
          <h2 className="text-xl font-bold text-[#091426]">{session?.user?.name || "سائق"}</h2>
          <p className="text-gray-500 text-sm mt-1">{(session?.user as any)?.phone || ""}</p>
          {vehicle && <p className="text-[#E05A2B] text-sm mt-1 font-bold">{VEHICLE_LABELS[vehicle] || vehicle}</p>}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <h3 className="font-bold text-[#091426] mb-4">حالة الاشتراك</h3>
          <div className="flex items-center justify-between"><span className="text-sm text-gray-500">الحالة</span><span className={`px-3 py-1 rounded-full text-xs font-bold ${sub?.subscriptionStatus === "active" ? "bg-green-100 text-green-700" : sub?.subscriptionStatus === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>{sub?.subscriptionStatus === "active" ? "نشط" : sub?.subscriptionStatus === "pending" ? "معلق" : "غير نشط"}</span></div>
          {days !== null && <div className="flex items-center justify-between mt-3"><span className="text-sm text-gray-500">المتبقي</span><span className={`text-sm font-bold ${days <= 5 ? "text-red-500" : "text-green-600"}`}>{days <= 0 ? "منتهي" : `${days} يوم`}</span></div>}
        </div>
        <button onClick={() => signOut({ redirect: true, callbackUrl: "/login" })} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-md text-center cursor-pointer text-base">تسجيل الخروج</button>
      </main>
    </div>
  );
}
