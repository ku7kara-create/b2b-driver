"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="w-full sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200 flex flex-row-reverse justify-between items-center px-4 h-16">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#E05A2B] flex items-center justify-center text-white">
            <span className="material-symbols-outlined">shield_person</span>
          </div>
          <h1 className="text-xl font-bold text-[#E05A2B]">إدارة النظام</h1>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <span className="material-symbols-outlined text-gray-500">logout</span>
        </button>
      </header>

      <main className="p-4">{children}</main>

      <nav className="fixed bottom-0 w-full flex flex-row-reverse justify-around items-center h-16 bg-white border-t border-gray-200 shadow-sm z-50">
        {[
          { href: "/admin/dashboard", icon: "home", label: "الرئيسية" },
          { href: "/admin/customers", icon: "how_to_reg", label: "التسجيل" },
          { href: "/admin/drivers", icon: "receipt_long", label: "الدفع" },
          { href: "/admin/trips", icon: "more_horiz", label: "المزيد" },
        ].map((it) => (
          <Link key={it.href} href={it.href} className="flex flex-col items-center justify-center text-gray-400 hover:text-[#E05A2B] px-4 h-full">
            <span className="material-symbols-outlined">{it.icon}</span>
            <span className="text-xs mt-1">{it.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
