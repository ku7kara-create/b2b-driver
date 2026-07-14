"use client";

import { useState, useEffect } from "react";

interface DriverData {
  id: string;
  subscriptionStatus: string;
  subscriptionExpiry: string | null;
  isAvailable: boolean;
  rating: number;
  totalTrips: number;
  idNumber: string | null;
  licenseType: string | null;
  user: { id: string; name: string; phone: string; isApproved: boolean };
}

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<DriverData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/stats?all=true");
        if (res.ok) {
          const data = await res.json();
          const allDrivers = (data.pendingUsers || []).filter((u: any) => u.role === "driver" && u.driver);
          setDrivers(allDrivers.map((u: any) => ({ ...u.driver, user: { id: u.id, name: u.name, phone: u.phone, isApproved: u.isApproved } })));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function toggleDriver(driverId: string, currentStatus: string) {
    setActionId(driverId);
    const action = currentStatus === "active" ? "deactivate" : "activate";
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setDrivers((prev) =>
          prev.map((d) =>
            d.id === driverId
              ? {
                  ...d,
                  subscriptionStatus: action === "activate" ? "active" : "inactive",
                  subscriptionExpiry: data.expiresAt || d.subscriptionExpiry,
                  isAvailable: action === "activate",
                }
              : d,
          ),
        );
      }
    } catch {}
    setActionId(null);
  }

  function getDaysRemaining(expiry: string | null): number | null {
    if (!expiry) return null;
    const diff = new Date(expiry).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  if (loading) return <div className="text-center py-20 text-gray-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#091426]">إدارة السائقين</h1>
        <p className="text-sm text-gray-500 mt-1">{drivers.length} سائق مسجل</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">الهاتف</th>
                <th className="px-4 py-3">رقم الهوية</th>
                <th className="px-4 py-3">الرخصة</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">المتبقي</th>
                <th className="px-4 py-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-gray-400">لا يوجد سائقين مسجلين</td>
                </tr>
              ) : (
                drivers.map((d) => {
                  const days = getDaysRemaining(d.subscriptionExpiry);
                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-[#091426]">{d.user.name}</td>
                      <td className="px-4 py-3 text-gray-500" dir="ltr">{d.user.phone}</td>
                      <td className="px-4 py-3 text-gray-500" dir="ltr">{d.idNumber || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{d.licenseType || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          d.subscriptionStatus === "active" ? "bg-green-100 text-green-700" :
                          d.subscriptionStatus === "pending" ? "bg-yellow-100 text-yellow-700" :
                          d.subscriptionStatus === "expired" ? "bg-red-100 text-red-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {d.subscriptionStatus === "active" ? "مفعل" :
                           d.subscriptionStatus === "pending" ? "معلق" :
                           d.subscriptionStatus === "expired" ? "منتهي" : "معطل"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {d.subscriptionStatus === "active" && days !== null
                          ? (days <= 0 ? <span className="text-red-500 font-bold">منتهي اليوم</span> :
                             days <= 5 ? <span className="text-orange-500 font-bold">متبقي {days} يوم</span> :
                             <span className="text-green-600">متبقي {days} يوم</span>)
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {d.subscriptionStatus === "active" ? (
                          <button
                            onClick={() => toggleDriver(d.id, d.subscriptionStatus)}
                            disabled={actionId === d.id}
                            style={{ backgroundColor: "#FEE2E2", color: "#B91C1C", fontWeight: "bold", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px" }}
                          >
                            {actionId === d.id ? "جاري..." : "تعطيل الحساب"}
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleDriver(d.id, d.subscriptionStatus)}
                            disabled={actionId === d.id}
                            style={{ backgroundColor: "#059669", color: "white", fontWeight: "bold", padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)", display: "block" }}
                          >
                            {actionId === d.id ? "جاري..." : "تفعيل الحساب"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
