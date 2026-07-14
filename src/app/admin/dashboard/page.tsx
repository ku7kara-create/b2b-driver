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

  if (loading) return <div className="text-center py-16 text-gray-400">جاري التحميل...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">طلبات معلقة</p>
            <p className="text-3xl font-bold text-[#E05A2B]">{pendingUsers.length}</p>
          </div>
          <div className="bg-orange-50 p-3 rounded-full">
            <span className="material-symbols-outlined text-[#E05A2B] text-2xl">pending_actions</span>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-1">
          <span className="material-symbols-outlined text-blue-500">local_shipping</span>
          <p className="text-xs text-gray-500">سائقين نشطين</p>
          <p className="text-xl font-bold text-[#091426]">{stats?.drivers || 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-1">
          <span className="material-symbols-outlined text-red-500">payments</span>
          <p className="text-xs text-gray-500">دفعات معلقة</p>
          <p className="text-xl font-bold text-[#091426]">{driversWithPendingSub.length}</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#091426]">طلبات التسجيل الجديدة</h2>
          {pendingRegistrations.length > 0 && (
            <span className="text-xs text-[#E05A2B] bg-orange-50 px-2 py-1 rounded-full font-bold">{pendingRegistrations.length} طلبات</span>
          )}
        </div>
        <div className="space-y-3">
          {pendingRegistrations.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">لا توجد طلبات تسجيل جديدة</div>
          ) : (
            pendingRegistrations.map((user) => (
              <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-500">{user.role === "driver" ? "local_shipping" : "person"}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#091426]">{user.name} ({user.role === "driver" ? "سائق" : "زبون"})</p>
                    <p className="text-xs text-gray-500" dir="ltr">{user.phone}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => approveUser(user.id)} className="flex-1 bg-[#E05A2B] text-white font-bold py-2.5 rounded-lg text-sm">موافقة</button>
                  <button onClick={() => rejectUser(user.id)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-2.5 rounded-lg text-sm">رفض</button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-[#091426]">تفعيل الاشتراكات</h2>
        </div>
        <div className="space-y-3">
          {driversWithPendingSub.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">لا توجد اشتراكات معلقة</div>
          ) : (
            driversWithPendingSub.map((user) => (
              <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm border-r-4 border-r-[#E05A2B] relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#E05A2B] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">مدفوع</div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-full border-2 border-[#E05A2B] p-0.5">
                      <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-600">person</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-[#091426]">{user.name}</p>
                      <p className="text-xs text-gray-500" dir="ltr">{user.phone}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-gray-500">قيمة الاشتراك</p>
                    <p className="font-bold text-[#E05A2B]">150.00 LYD</p>
                  </div>
                </div>
                <button onClick={() => activateSubscription(user.driver?.id || "", user.id)} className="w-full bg-[#091426] text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">verified_user</span>
                  تفعيل الحساب
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
