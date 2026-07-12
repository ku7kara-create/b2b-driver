"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface AdminStats {
  users: number;
  drivers: number;
  trips: number;
  completedTrips: number;
  revenue: number;
}

interface PendingSub {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  driver: {
    id: string;
    subscriptionStatus: string;
    user: { name: string; phone: string };
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingSubs, setPendingSubs] = useState<PendingSub[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setPendingSubs(data.pendingSubscriptions || []);
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  async function approveSubscription(subscriptionId: string, driverId: string) {
    try {
      await fetch(`/api/admin/subscriptions/${subscriptionId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId }),
      });
      setPendingSubs((prev) => prev.filter((s) => s.id !== subscriptionId));
      window.location.reload();
    } catch {}
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex w-64 bg-primary-container text-white flex-col p-4 min-h-screen">
        <div className="text-2xl font-bold mb-8 text-center">B2B Driver</div>
        <nav className="space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded-lg bg-white/10 font-bold">
            <span className="material-symbols-outlined">dashboard</span>
            لوحة التحكم
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">people</span>
            المستخدمين
          </Link>
          <Link href="/admin/drivers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">local_shipping</span>
            السائقين
          </Link>
          <Link href="/admin/trips" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">route</span>
            الرحلات
          </Link>
          <Link href="/admin/payments" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
            <span className="material-symbols-outlined">payments</span>
            المدفوعات
          </Link>
        </nav>
      </aside>

      <main className="flex-grow p-4 md:p-8">
        <h1 className="text-2xl font-bold text-primary mb-6">لوحة التحكم</h1>

        {loading ? (
          <div className="text-center py-12">جاري التحميل...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "المستخدمين", value: stats?.users, color: "bg-blue-100 text-blue-700" },
                { label: "السائقين", value: stats?.drivers, color: "bg-orange-100 text-orange-700" },
                { label: "الرحلات", value: stats?.trips, color: "bg-purple-100 text-purple-700" },
                { label: "الإيرادات (LYD)", value: stats?.revenue?.toFixed(0), color: "bg-green-100 text-green-700" },
              ].map((s) => (
                <div key={s.label} className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm">
                  <p className="text-sm text-on-surface-variant mb-2">{s.label}</p>
                  <p className="text-3xl font-bold text-primary">{s.value || 0}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant">
                <h2 className="text-xl font-bold text-primary">اشتراكات بانتظار الموافقة</h2>
              </div>
              {pendingSubs.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant">
                  لا توجد طلبات اشتراك معلقة
                </div>
              ) : (
                <div className="divide-y divide-outline-variant">
                  {pendingSubs.map((sub) => (
                    <div key={sub.id} className="p-6 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-primary">{sub.driver.user.name}</p>
                        <p className="text-sm text-on-surface-variant">{sub.driver.user.phone}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-secondary">{sub.amount} LYD</p>
                        <button
                          onClick={() => approveSubscription(sub.id, sub.driver.id)}
                          className="mt-2 bg-secondary-container text-white px-4 py-2 rounded-lg font-bold text-sm hover:brightness-110 active:scale-95 transition-all"
                        >
                          موافقة
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
