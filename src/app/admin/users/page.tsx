"use client";

import { useState, useEffect } from "react";

interface UserData {
  id: string; name: string; phone: string; role: string; isApproved: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/stats?all=true");
        if (res.ok) {
          const data = await res.json();
          setUsers((data.pendingUsers || []).filter((u: UserData) => u.role === "customer"));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function toggleUser(userId: string, isApproved: boolean) {
    setActionId(userId);
    try {
      await fetch(`/api/admin/users/${userId}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: isApproved ? "block" : "unblock" }),
      });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, isApproved: !isApproved } : u));
    } catch {}
    setActionId(null);
  }

  if (loading) return <div className="text-center py-20 text-gray-400">جاري التحميل...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#091426]">المستخدمين</h1>
        <p className="text-sm text-gray-500 mt-1">{users.length} زبون مسجل</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">الهاتف</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-16 text-center text-gray-400">لا يوجد زبائن مسجلين</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#091426]">{u.name}</td>
                    <td className="px-4 py-3 text-gray-500" dir="ltr">{u.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isApproved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.isApproved ? "نشط" : "محظور"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleUser(u.id, u.isApproved)}
                        disabled={actionId === u.id}
                        style={{ padding: "6px 12px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "bold", backgroundColor: u.isApproved ? "#FEE2E2" : "#059669", color: u.isApproved ? "#B91C1C" : "white" }}
                      >
                        {actionId === u.id ? "جاري..." : u.isApproved ? "حظر الحساب" : "إلغاء الحظر"}
                      </button>
                    </td>
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
