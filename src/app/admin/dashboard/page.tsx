"use client";

import { useState, useEffect } from "react";

interface Stats { users: number; drivers: number; trips: number; completedTrips: number; revenue: number; }
interface PendingUser { id: string; name: string; phone: string; role: string; createdAt: string; driver?: { subscriptionStatus: string; id: string } | null; }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setPendingUsers(data.pendingUsers || []);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function approveUser(userId: string) {
    try {
      await fetch(`/api/admin/users/${userId}/approve`, { method: "POST" });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {}
  }

  async function rejectUser(userId: string) {
    try {
      await fetch(`/api/admin/users/${userId}/reject`, { method: "POST" });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {}
  }

  async function activateSubscription(driverId: string, userId: string) {
    try {
      const res = await fetch("/api/admin/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, userId, amount: 150 }),
      });
      if (res.ok) {
        setPendingUsers((prev) => prev.map((u) => u.id === userId ? { ...u, driver: { ...u.driver!, subscriptionStatus: "active", id: driverId } } : u));
      }
    } catch {}
  }

  if (loading) return <div className="text-center py-16 text-gray-400">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#091426]">لوحة التحكم</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "المستخدمين", value: stats?.users || 0, color: "bg-blue-50 text-blue-600" },
          { label: "السائقين", value: stats?.drivers || 0, color: "bg-orange-50 text-orange-600" },
          { label: "الرحلات", value: stats?.trips || 0, color: "bg-purple-50 text-purple-600" },
          { label: "الإيرادات LYD", value: (stats?.revenue || 0).toFixed(0), color: "bg-green-50 text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-[#091426]">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#091426]">طلبات بانتظار المراجعة</h3>
          {pendingUsers.length > 0 && (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">{pendingUsers.length} جديد</span>
          )}
        </div>
        {pendingUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">لا توجد طلبات معلقة</div>
        ) : (
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">الهاتف</th>
                <th className="px-4 py-3">الدور</th>
                <th className="px-4 py-3">التاريخ</th>
                <th className="px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-[#091426]">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500" dir="ltr">{user.phone}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
                      {user.role === "driver" ? "سائق" : "زبون"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString("ar")}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-2">
                      {user.role === "driver" && user.driver?.subscriptionStatus !== "active" && (
                        <button onClick={() => activateSubscription(user.driver?.id || "", user.id)}
                          className="bg-[#E05A2B] text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                          تفعيل
                        </button>
                      )}
                      <button onClick={() => approveUser(user.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">موافقة</button>
                      <button onClick={() => rejectUser(user.id)} className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold">رفض</button>
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
