"use client";

import { useState, useEffect } from "react";

interface Trip {
  id: string; serviceType: string; pickupAddress: string; dropoffAddress: string;
  status: string; agreedPrice: number | null; createdAt: string;
  customer: { name: string; phone: string } | null;
  driver: { user: { name: string } } | null;
}

const SERVICE_LABELS: Record<string, string> = { car: "سيارة خاصة", porter: "بورتر", tow_truck: "ساحبة" };
const STATUS_LABELS: Record<string, string> = { pending: "معلق", accepted: "مقبول", started: "جاري", completed: "مكتمل" };
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-blue-100 text-blue-700",
  started: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
};

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/trips");
        if (res.ok) setTrips((await res.json()).trips || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#091426]">سجل الرحلات</h1>
        <p className="text-sm text-gray-500 mt-1">{trips.length} رحلة</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">الطلب</th>
                <th className="px-4 py-3">الخدمة</th>
                <th className="px-4 py-3">العميل</th>
                <th className="px-4 py-3">السائق</th>
                <th className="px-4 py-3">السعر</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trips.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-gray-400">لا توجد رحلات</td></tr>
              ) : (
                trips.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#091426]">#{t.id.slice(-8)}</td>
                    <td className="px-4 py-3 text-gray-500">{SERVICE_LABELS[t.serviceType] || t.serviceType}</td>
                    <td className="px-4 py-3 text-gray-500">{t.customer?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{t.driver?.user?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{t.agreedPrice ? `${t.agreedPrice.toFixed(2)} LYD` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[t.status] || "bg-gray-100 text-gray-600"}`}>
                        {STATUS_LABELS[t.status] || t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(t.createdAt).toLocaleDateString("ar")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
