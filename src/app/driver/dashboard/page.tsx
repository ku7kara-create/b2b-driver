"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface TripRequest {
  id: string; serviceType: string; pickupAddress: string; dropoffAddress: string;
  cargoDetails: string | null; status: string; createdAt: string;
}

const SERVICE_LABELS: Record<string, string> = { car: "سيارة خاصة", porter: "بورتر", tow_truck: "ساحبة" };

export default function DriverDashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(true);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch("/api/driver/trips");
      if (res.ok) { setRequests((await res.json()).trips || []); setSubscriptionActive(true); }
      else if (res.status === 403) setSubscriptionActive(false);
    } catch {}
  }, []);

  useEffect(() => { fetchRequests().finally(() => setLoading(false)); }, [fetchRequests]);

  if (!session) return <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center"><Link href="/login" className="text-[#E05A2B] font-bold">تسجيل الدخول</Link></div>;
  if (!subscriptionActive) return (
    <div className="min-h-screen bg-[#F9F9F9] flex items-center justify-center p-4">
      <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-sm"><div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6"><span className="text-4xl">🔒</span></div><h2 className="text-2xl font-bold text-[#091426] mb-3">الاشتراك غير مفعل</h2><p className="text-gray-500 mb-6">يجب تفعيل الاشتراك الشهري (150 LYD)</p><Link href="/driver/subscription" className="inline-block bg-[#E05A2B] text-white font-bold px-8 py-3 rounded-xl">تفعيل الاشتراك</Link></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200 flex flex-row-reverse justify-between items-center px-4 py-2">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-[#091426]">سائق لوجستي</h1>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined text-gray-500 p-2 cursor-pointer">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#E05A2B] rounded-full border-2 border-white"></span>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {requests.length > 0 && (
          <div className="bg-[#E05A2B] text-white p-4 rounded-xl flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <span className="material-symbols-outlined">local_shipping</span>
              </div>
              <div><p className="font-bold">طلب جديد متوفر بالقرب منك!</p><p className="text-xs opacity-90">{requests.length} طلبات في مدينتك</p></div>
            </div>
            <button onClick={fetchRequests} className="bg-white text-[#E05A2B] px-4 py-1 rounded-lg font-bold text-sm">تحديث</button>
          </div>
        )}

        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div><span className="text-sm text-gray-500">الحالة</span><div className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span><span className="text-lg font-bold text-green-600">مستعد لاستلام الطلبات</span></div></div>
          <div className="bg-green-50 px-3 py-1 rounded-full"><span className="text-xs text-green-600">جاهز للطلبات</span></div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <Link href="/driver/trips" className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1 hover:bg-gray-50">
              <span className="material-symbols-outlined text-[#E05A2B] text-xl">history</span>
              <span className="text-xs text-gray-700">سجل الرحلات</span>
            </Link>
            <Link href="/driver/subscription" className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center justify-center gap-1 hover:bg-gray-50">
              <span className="material-symbols-outlined text-[#E05A2B] text-xl">credit_card</span>
              <span className="text-xs text-gray-700">المحفظة</span>
            </Link>
          </div>

        <div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#091426]">طلبات قريبة</h2><button onClick={() => { setLoading(true); fetchRequests().finally(() => setLoading(false)); }} className="text-[#E05A2B] text-sm">تحديث</button></div>

        {loading ? <div className="text-center py-12 text-gray-400">جاري التحميل...</div> :
         requests.length === 0 ? <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">لا توجد طلبات قريبة</div> :
         <div className="space-y-3">
           {requests.map((t) => (
             <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center"><span className="material-symbols-outlined text-[#E05A2B]">{t.serviceType === "car" ? "directions_car" : "local_shipping"}</span></div>
                 <div><span className="font-bold text-sm">{SERVICE_LABELS[t.serviceType]}</span><p className="text-xs text-gray-500 truncate max-w-[150px]">{t.pickupAddress} → {t.dropoffAddress}</p></div>
               </div>
               <button onClick={() => router.push(`/driver/bid/${t.id}`)} className="bg-[#E05A2B] text-white px-5 py-2 rounded-lg font-bold text-sm">عرض</button>
             </div>
           ))}
         </div>}
      </main>
    </div>
  );
}
