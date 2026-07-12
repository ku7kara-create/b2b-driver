"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
}

interface Stats {
  users: number;
  drivers: number;
  trips: number;
  completedTrips: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setPendingUsers(data.pendingUsers || []);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  async function approveUser(userId: string, role: string) {
    try {
      await fetch(`/api/admin/users/${userId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {}
  }

  async function rejectUser(userId: string) {
    try {
      await fetch(`/api/admin/users/${userId}/reject`, { method: "POST" });
      setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">طلبات تسجيل الزبائن</h1>
          <p className="text-on-surface-variant">مراجعة وتدقيق حسابات الشركات والزبائن الجدد.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-surface-container-lowest text-primary px-4 py-2 rounded-lg font-semibold hover:shadow-md transition-all flex items-center gap-2 border border-outline-variant">
            <span className="material-symbols-outlined text-sm">calendar_today</span>
            {new Date().toLocaleDateString("ar")}
          </button>
        </div>
      </header>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي المعلق", value: pendingUsers.length, icon: "pending_actions", bg: "bg-primary/10", text: "text-primary" },
          { label: "المستخدمين", value: stats?.users || 0, icon: "group", bg: "bg-blue-50", text: "text-blue-600" },
          { label: "السائقين", value: stats?.drivers || 0, icon: "local_shipping", bg: "bg-orange-50", text: "text-orange-600" },
          { label: "الرحلات المكتملة", value: stats?.completedTrips || 0, icon: "task_alt", bg: "bg-green-50", text: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
            <div className={`${s.bg} p-3 rounded-2xl ${s.text}`}>
              <span className="material-symbols-outlined text-2xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant font-bold mb-1">{s.label}</p>
              <h4 className="text-2xl font-extrabold text-primary">{s.value}</h4>
            </div>
          </div>
        ))}
      </section>

      {/* Pending Users Table */}
      <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center">
          <h3 className="text-xl font-bold text-primary">طلبات بانتظار المراجعة</h3>
          {pendingUsers.length > 0 && (
            <span className="bg-error-container text-error px-3 py-1 rounded-full text-xs font-bold">
              {pendingUsers.length} طلب جديد
            </span>
          )}
        </div>
        <div className="overflow-x-auto">
          {pendingUsers.length === 0 ? (
            <div className="p-16 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">check_circle</span>
              لا توجد طلبات معلقة - جميع الحسابات تمت مراجعتها
            </div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant text-sm font-bold border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-4">الاسم</th>
                  <th className="px-4 py-4">الهاتف</th>
                  <th className="px-4 py-4">الدور</th>
                  <th className="px-4 py-4">تاريخ التسجيل</th>
                  <th className="px-4 py-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {pendingUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-variant/10 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-outline-variant">
                          <span className="material-symbols-outlined">
                            {user.role === "driver" ? "local_shipping" : "person"}
                          </span>
                        </div>
                        <div>
                          <p className="font-bold text-primary">{user.name}</p>
                          <p className="text-xs text-on-surface-variant">
                            {user.role === "driver" ? "حساب سائق" : "حساب فردي"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-primary" dir="ltr">
                      {user.phone}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-surface-container text-on-surface">
                        {user.role === "driver" ? "سائق" : "زبون"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-on-surface-variant">
                      {new Date(user.createdAt).toLocaleDateString("ar")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => approveUser(user.id, user.role)}
                          className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-all shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          موافقة
                        </button>
                        <button
                          onClick={() => rejectUser(user.id)}
                          className="flex items-center gap-1 bg-surface-variant text-on-surface-variant px-4 py-2 rounded-lg text-sm font-bold hover:bg-error hover:text-white transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">cancel</span>
                          رفض
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Analytics */}
      {stats && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm">
            <h3 className="text-lg font-bold text-primary mb-6">إحصائيات المنصة</h3>
            <div className="space-y-4">
              {[
                { label: "المستخدمين", value: stats.users, max: Math.max(stats.users, 1) * 1.5 },
                { label: "السائقين", value: stats.drivers, max: Math.max(stats.drivers, 1) * 1.5 },
                { label: "الرحلات", value: stats.trips, max: Math.max(stats.trips, 1) * 1.5 },
                { label: "المكتملة", value: stats.completedTrips, max: Math.max(stats.completedTrips, 1) * 1.5 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-on-surface-variant">{item.label}</span>
                    <span className="font-bold text-primary">{item.value}</span>
                  </div>
                  <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
                    <div
                      className="h-full bg-secondary-container rounded-full transition-all"
                      style={{ width: `${(item.value / item.max) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between text-sm">
              <span className="text-on-surface-variant">الإيرادات: <strong className="text-primary">{stats.revenue?.toFixed(2)} LYD</strong></span>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-center">
            <h3 className="text-lg font-bold text-primary mb-4">سرعة التفعيل</h3>
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-primary">
                      {stats.users > 0 ? Math.round((stats.users / (stats.users + pendingUsers.length + 1)) * 100) : 0}%
                    </span>
                    <span className="text-xs text-on-surface-variant">نسبة الموافقة</span>
                  </div>
                  <div className="h-10 w-px bg-outline-variant"></div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-green-600">{pendingUsers.length}</span>
                    <span className="text-xs text-on-surface-variant">قيد الانتظار</span>
                  </div>
                </div>
              </div>
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="58" fill="transparent" stroke="#e5eeff" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r="58" fill="transparent"
                    stroke="#fd761a"
                    strokeWidth="12"
                    strokeDasharray="364.4"
                    strokeDashoffset={364.4 * (1 - (stats.users / Math.max(stats.users + pendingUsers.length, 1)))}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-extrabold text-primary">
                    {stats.users > 0 ? Math.round((stats.users / Math.max(stats.users + pendingUsers.length, 1)) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
