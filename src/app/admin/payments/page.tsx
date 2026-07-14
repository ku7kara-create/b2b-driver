"use client";

import { useState, useEffect } from "react";

interface Payment {
  id: string; driverId: string; amount: number; currency: string; status: string;
  paidAt: string | null; expiresAt: string | null; createdAt: string;
  driver: { user: { name: string; phone: string } };
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/payments");
        if (res.ok) setPayments((await res.json()).payments || []);
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-center py-20 text-gray-400">جاري التحميل...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#091426]">المدفوعات</h1>
        <p className="text-sm text-gray-500 mt-1">{payments.length} عملية دفع</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">السائق</th>
                <th className="px-4 py-3">الهاتف</th>
                <th className="px-4 py-3">المبلغ</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">تاريخ الدفع</th>
                <th className="px-4 py-3">تاريخ الانتهاء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-gray-400">لا توجد مدفوعات</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-[#091426]">{p.driver?.user?.name || "—"}</td>
                    <td className="px-4 py-3 text-gray-500" dir="ltr">{p.driver?.user?.phone || "—"}</td>
                    <td className="px-4 py-3 font-bold text-[#E05A2B]">{p.amount.toFixed(2)} {p.currency}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {p.status === "paid" ? "مدفوع" : "معلق"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.paidAt ? new Date(p.paidAt).toLocaleDateString("ar") : "—"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("ar") : "—"}</td>
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
