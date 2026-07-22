"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Header } from "@/components/header";

export default function CustomerProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <Header title="حسابي" backHref="/customer/dashboard" />

      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div style={{ backgroundColor: "white", borderRadius: "16px", padding: "24px", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb" }}>
          <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#FF8C00", color: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "32px", fontWeight: "bold" }}>
            {session?.user?.name?.charAt(0) || "ز"}
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#212121", marginBottom: "4px" }}>{session?.user?.name || "زبون"}</h2>
          <p style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px", direction: "ltr" }}>{(session?.user as any)?.phone || ""}</p>
          <span style={{ padding: "2px 12px", borderRadius: "9999px", fontSize: "12px", fontWeight: "bold", backgroundColor: "#fef3c7", color: "#92400e" }}>زبون</span>
        </div>

        <button onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
          style={{ width: "100%", padding: "16px", backgroundColor: "#fef2f2", color: "#dc2626", border: "2px solid #fca5a5", borderRadius: "12px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <span className="material-symbols-outlined">logout</span>
          تسجيل الخروج
        </button>
      </main>

      <nav className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 flex flex-row-reverse justify-around items-center py-2 shadow-sm">
        {[
          { href: "/customer/dashboard", icon: "home", label: "الرئيسية" },
          { href: "/customer/request", icon: "add_circle", label: "طلب جديد" },
          { href: "/customer/bids", icon: "local_shipping", label: "الطلبات" },
          { href: "/customer/profile", icon: "person", label: "حسابي" },
        ].map((it) => (
          <Link key={it.href} href={it.href} className={`flex flex-col items-center px-3 py-1 ${it.label === "حسابي" ? "text-[#FF8C00]" : "text-gray-400"} hover:text-[#FF8C00]`}>
            <span className="material-symbols-outlined">{it.icon}</span>
            <span className="text-xs mt-1">{it.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
