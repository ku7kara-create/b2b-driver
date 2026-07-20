"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function DriverWalletPage() {
  const [earnings, setEarnings] = useState({ today: 0, trips: 0, total: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("today");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/driver/earnings?filter=${filter}`);
        if (r.ok) setEarnings(await r.json());
      } catch {}
      setLoading(false);
    })();
  }, [filter]);

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200 flex flex-row-reverse items-center px-4 h-16">
        <Link href="/driver/dashboard" className="p-2 hover:bg-gray-100 rounded-full"><span className="material-symbols-outlined">arrow_forward</span></Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">المحفظة</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: "today", label: "اليوم" },
            { key: "week", label: "هذا الأسبوع" },
            { key: "month", label: "هذا الشهر" },
            { key: "all", label: "الكل" },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{padding:"8px 16px",borderRadius:"9999px",fontSize:"12px",fontWeight:"bold",border:filter===f.key?"2px solid #FF8C00":"1px solid #d1d5db",backgroundColor:filter===f.key?"#FFF7ED":"white",color:filter===f.key?"#FF8C00":"#6b7280",cursor:"pointer",whiteSpace:"nowrap"}}
            >{f.label}</button>
          ))}
        </div>

        {loading ? <div className="text-center py-12 text-gray-400">جاري التحميل...</div> : (
          <>
            <div style={{backgroundColor:"#FF8C00",color:"#ffffff",borderRadius:"16px",padding:"24px",textAlign:"center"}}>
              <p style={{fontSize:"14px",color:"#ffffff",marginBottom:"8px",opacity:0.9}}>الرصيد الحالي</p>
              <p style={{fontSize:"36px",fontWeight:"800",color:"#ffffff"}}>{earnings.totalEarnings.toFixed(2)} <span style={{fontSize:"20px",fontWeight:"700",color:"#ffffff"}}>LYD</span></p>
              <p style={{fontSize:"12px",color:"#ffffff",marginTop:"4px",opacity:0.8}}>إجمالي الأرباح</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                <span className="material-symbols-outlined text-[#FF8C00] text-2xl">local_shipping</span>
                <p className="text-xs text-gray-500 mt-2">عدد الرحلات</p>
                <p style={{fontSize:"24px",fontWeight:"bold",color:"#212121"}}>{earnings.total}</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-center">
                <span className="material-symbols-outlined text-[#FF8C00] text-2xl">account_balance_wallet</span>
                <p className="text-xs text-gray-500 mt-2">أرباح الرحلات</p>
                <p style={{fontSize:"24px",fontWeight:"bold",color:"#212121"}}>{earnings.today.toFixed(2)} <span style={{fontSize:"14px",color:"#6b7280"}}>LYD</span></p>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
