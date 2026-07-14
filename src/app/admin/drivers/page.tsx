"use client";

import { useState, useEffect } from "react";

interface DriverUser {
  id: string; name: string; phone: string; role: string; createdAt: string;
  driver: { id: string; subscriptionStatus: string; idNumber: string | null; licenseType: string | null; rating: number } | null;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) setDrivers(((await res.json()).pendingUsers || []).filter((u: DriverUser) => u.role === "driver"));
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function activateSub(driverId: string, userId: string) {
    try {
      await fetch("/api/admin/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ driverId, userId, amount: 150 }) });
      setDrivers((prev) => prev.map((d) => d.id === userId ? { ...d, driver: { ...d.driver!, subscriptionStatus: "active", id: driverId } } : d));
    } catch {}
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#091426]">طلبات السائقين</h1>
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? <div className="p-12 text-center text-gray-400">جاري التحميل...</div> :
         drivers.length === 0 ? <div className="p-12 text-center text-gray-400">لا توجد طلبات</div> :
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b">
            <tr><th className="px-4 py-3">الاسم</th><th className="px-4 py-3">الهاتف</th><th className="px-4 py-3">الهوية</th><th className="px-4 py-3">الرخصة</th><th className="px-4 py-3">الاشتراك</th><th className="px-4 py-3">تفعيل</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drivers.map((d) => (
              <tr key={d.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-[#091426]">{d.name}</td>
                <td className="px-4 py-3 text-gray-500" dir="ltr">{d.phone}</td>
                <td className="px-4 py-3 text-gray-500" dir="ltr">{d.driver?.idNumber || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{d.driver?.licenseType || "—"}</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-bold ${d.driver?.subscriptionStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{d.driver?.subscriptionStatus === "active" ? "نشط" : "معلق"}</span></td>
                <td className="px-4 py-3">{d.driver?.subscriptionStatus !== "active" && <button onClick={() => activateSub(d.driver?.id || "", d.id)} className="bg-[#E05A2B] text-white px-3 py-1.5 rounded-lg text-xs font-bold">تفعيل</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>}
      </div>
    </div>
  );
}
