"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Header } from "@/components/header";

const VEHICLE_LABELS: Record<string, string> = {
  car: "سيارة خاصة", porter: "بورتر وكنتر", tow_truck: "ساحبة", truck: "بورتر وكنتر", bike: "دراجة",
  private_car: "سيارة خاصة", porter_canter: "بورتر وكنتر",
};

export default function DriverProfilePage() {
  const { data: session } = useSession();
  const [sub, setSub] = useState<{ subscriptionStatus: string; subscriptionExpiry: string | null } | null>(null);
  const [vehicle, setVehicle] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [sRes, vRes] = await Promise.all([
          fetch("/api/driver/subscription"),
          fetch("/api/driver/vehicles"),
        ]);
        if (sRes.ok) setSub(await sRes.json());
        if (vRes.ok) { const d = await vRes.json(); setVehicle(d.type || null); }
      } catch {}
    })();
  }, []);

  const days = sub?.subscriptionExpiry
    ? Math.ceil((new Date(sub.subscriptionExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-24">
      <Header title="حسابي" backHref="/driver/dashboard" />

      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        {/* Profile Card */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#FF8C00", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "32px", fontWeight: "bold" }}>
            {session?.user?.name?.charAt(0) || "س"}
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#212121", marginBottom: "4px" }}>{session?.user?.name || "سائق"}</h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "2px", direction: "ltr" }}>{(session?.user as any)?.phone || ""}</p>
          {vehicle && <p style={{ fontSize: "14px", color: "#FF8C00", fontWeight: "bold", marginTop: "4px" }}>🚛 {VEHICLE_LABELS[vehicle] || vehicle}</p>}
        </div>

        {/* Subscription Card */}
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "20px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "bold", color: "#212121", marginBottom: "16px" }}>حالة الاشتراك</h3>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>الحالة</span>
            <span style={{ padding: "4px 12px", borderRadius: "9999px", fontSize: "13px", fontWeight: "bold", backgroundColor: sub?.subscriptionStatus === "active" ? "#dcfce7" : "#fef3c7", color: sub?.subscriptionStatus === "active" ? "#166534" : "#92400e" }}>
              {sub?.subscriptionStatus === "active" ? "نشط" : sub?.subscriptionStatus === "pending" ? "معلق" : "غير نشط"}
            </span>
          </div>
          {days !== null && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
              <span style={{ fontSize: "14px", color: "#6b7280" }}>المتبقي</span>
              <span style={{ fontSize: "16px", fontWeight: "bold", color: days <= 5 ? "#dc2626" : "#16a34a" }}>
                {days <= 0 ? "منتهي" : `${days} يوم`}
              </span>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
          style={{
            width: "100%",
            padding: "16px",
            backgroundColor: "#fef2f2",
            color: "#dc2626",
            border: "2px solid #fca5a5",
            borderRadius: "12px",
            fontWeight: "bold",
            fontSize: "16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <span className="material-symbols-outlined">logout</span>
          تسجيل الخروج
        </button>
      </main>
    </div>
  );
}
