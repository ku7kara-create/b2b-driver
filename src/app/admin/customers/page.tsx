"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  phone: string;
  role: string;
  createdAt: string;
  driver?: { subscriptionStatus: string } | null;
}

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setUsers((data.pendingUsers || []).filter((u: User) => u.role === "customer"));
        }
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-primary mb-1">طلبات تسجيل الزبائن</h1>
        <p className="text-on-surface-variant">مراجعة حسابات الزبائن الجدد</p>
      </header>

      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-on-surface-variant">جاري التحميل...</div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl text-outline mb-4 block">check_circle</span>
            لا توجد طلبات زبائن معلقة
          </div>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant text-sm font-bold border-b">
              <tr>
                <th className="px-4 py-4">الاسم</th>
                <th className="px-4 py-4">الهاتف</th>
                <th className="px-4 py-4">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-surface-variant/10">
                  <td className="px-4 py-4 font-bold text-primary">{u.name}</td>
                  <td className="px-4 py-4 text-sm" dir="ltr">{u.phone}</td>
                  <td className="px-4 py-4 text-sm text-on-surface-variant">
                    {new Date(u.createdAt).toLocaleDateString("ar")}
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
