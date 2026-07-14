"use client";

import { useState, useEffect } from "react";

interface Stats { users: number; drivers: number; trips: number; completedTrips: number; revenue: number; }
interface PendingUser { id: string; name: string; phone: string; role: string; createdAt: string; driver?: { id: string; subscriptionStatus: string; idNumber: string | null } | null; }

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
      await fetch("/api/admin/subscriptions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ driverId, userId, amount: 150 }) });
      setPendingUsers((prev) => prev.map((u) => u.id === userId ? { ...u, driver: { ...u.driver!, subscriptionStatus: "active", id: driverId } } : u));
    } catch {}
  }

  const driversWithPendingSub = pendingUsers.filter((u) => u.role === "driver" && u.driver?.subscriptionStatus !== "active");
  const pendingRegistrations = pendingUsers.filter((u) => !driversWithPendingSub.find((d) => d.id === u.id));

  if (loading) return <div className="text-center py-20 text-gray-400">جاري التحميل...</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[#091426]">لوحة التحكم</h1>
        <p className="text-sm text-gray-500 mt-1">مرحباً بك في لوحة إدارة B2B Driver</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "طلبات معلقة", value: pendingUsers.length, icon: "pending_actions", color: "bg-orange-50 text-[#E05A2B]" },
          { label: "المستخدمين", value: stats?.users || 0, icon: "group", color: "bg-blue-50 text-blue-600" },
          { label: "السائقين", value: stats?.drivers || 0, icon: "local_shipping", color: "bg-green-50 text-green-600" },
          { label: "الإيرادات LYD", value: (stats?.revenue || 0).toFixed(0), icon: "payments", color: "bg-purple-50 text-purple-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`${s.color} p-3 rounded-xl`}>
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-[#091426]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Registration Requests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#091426]">طلبات التسجيل الجديدة</h2>
          {pendingRegistrations.length > 0 && (
            <span className="text-xs text-[#E05A2B] bg-orange-50 px-3 py-1 rounded-full font-bold">{pendingRegistrations.length} جديد</span>
          )}
        </div>

        {pendingRegistrations.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">لا توجد طلبات تسجيل جديدة</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRegistrations.map((user) => (
              <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-500 text-2xl">
                      {user.role === "driver" ? "local_shipping" : "person"}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-[#091426]">{user.name}</p>
                    <p className="text-xs text-gray-500" dir="ltr">{user.phone} · {user.role === "driver" ? "سائق" : "زبون"}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => approveUser(user.id)} className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    قبول
                  </button>
                  <button onClick={() => rejectUser(user.id)} className="flex-1 border-2 border-red-300 text-red-600 font-bold py-2.5 rounded-lg text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-sm">cancel</span>
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Subscription Activation */}
      {driversWithPendingSub.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-[#091426] mb-4">تفعيل الاشتراكات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {driversWithPendingSub.map((user) => (
              <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm border-r-4 border-r-[#E05A2B]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-[#091426]">{user.name}</p>
                    <p className="text-xs text-gray-500" dir="ltr">{user.phone}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">الاشتراك</p>
                    <p className="font-bold text-[#E05A2B]">150 LYD</p>
                  </div>
                </div>
                <button onClick={() => activateSubscription(user.driver?.id || "", user.id)} className="w-full bg-[#091426] text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-sm">verified_user</span>
                  تفعيل الحساب
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
