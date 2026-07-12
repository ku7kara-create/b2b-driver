"use client";

import { useState, useEffect } from "react";

interface DriverUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
  driver: { subscriptionStatus: string; idNumber: string | null; licenseType: string | null; rating: number } | null;
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setDrivers((data.pendingUsers || []).filter((u: DriverUser) => u.role === "driver"));
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  async function approveSubscription(driverId: string, userId: string) {
    try {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      const sub = await (await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, userId, amount: 150 }),
      })).json();

      if (sub.success) {
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === userId ? { ...d, driver: { ...d.driver!, subscriptionStatus: "active" } } : d,
          ),
        );
      }
    } catch {}
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary mb-1">طلبات تسجيل السائقين</h1>
        <p className="text-on-surface-variant">مراجعة وتفعيل حسابات السائقين الجدد</p>
      </header>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-on-surface-variant">جاري التحميل...</div>
        ) : drivers.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl text-outline mb-4 block">check_circle</span>
            لا توجد طلبات سائقين معلقة
          </div>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant text-sm font-bold border-b">
              <tr>
                <th className="px-4 py-4">الاسم</th>
                <th className="px-4 py-4">الهاتف</th>
                <th className="px-4 py-4">رقم الهوية</th>
                <th className="px-4 py-4">نوع الرخصة</th>
                <th className="px-4 py-4">حالة الاشتراك</th>
                <th className="px-4 py-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {drivers.map((d) => (
                <tr key={d.id} className="hover:bg-surface-variant/10">
                  <td className="px-4 py-4 font-bold text-primary">{d.name}</td>
                  <td className="px-4 py-4 text-sm" dir="ltr">{d.phone}</td>
                  <td className="px-4 py-4 text-sm" dir="ltr">{d.driver?.idNumber || "—"}</td>
                  <td className="px-4 py-4 text-sm">{d.driver?.licenseType || "—"}</td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      d.driver?.subscriptionStatus === "active" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {d.driver?.subscriptionStatus === "active" ? "نشط" : "معلق"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-center gap-2">
                      {d.driver?.subscriptionStatus !== "active" && (
                        <button
                          onClick={() => approveSubscription(d.id, d.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all"
                        >
                          تفعيل الاشتراك
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
