"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function DriverWalletPage() {
  const [earnings, setEarnings] = useState({ today: 0, trips: 0, total: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const r = await fetch("/api/driver/earnings"); if (r.ok) setEarnings(await r.json()); } catch {}
      setLoading(false);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200 flex flex-row-reverse items-center px-4 h-16">
        <Link href="/driver/dashboard" className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">arrow_forward</span></Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">المحفظة</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {loading ? <div className="text-center py-12 text-gray-400">جاري التحميل...</div> : (
          <>
            <div className="bg-[#1e293b] text-white rounded-xl p-6 text-center">
              <p className="text-sm text-gray-400 mb-2">الرصيد الحالي</p>
              <p style={{fontSize:"36px", fontWeight:"800", color:"#ffffff"}}>{earnings.totalEarnings.toFixed(2)} <span style={{fontSize:"20px", fontWeight:"700", color:"#ffffff"}}>LYD</span></p>
              <p className="text-xs text-gray-400 mt-1">إجمالي الأرباح</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                <span className="material-symbols-outlined text-[#E05A2B] text-2xl">local_shipping</span>
                <p className="text-xs text-gray-500 mt-2">عدد الرحلات</p>
                <p className="text-2xl font-bold text-[#091426]">{earnings.trips}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                <span className="material-symbols-outlined text-[#E05A2B] text-2xl">account_balance_wallet</span>
                <p className="text-xs text-gray-500 mt-2">أرباح الرحلات</p>
                <p className="text-2xl font-bold text-[#091426]">{earnings.today.toFixed(2)} <span className="text-sm text-gray-400">LYD</span></p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
