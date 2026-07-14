"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function CustomerProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      <header className="bg-white sticky top-0 z-50 border-b border-gray-200 flex flex-row-reverse items-center w-full px-4 h-16">
        <Link href="/customer/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
        <h1 className="text-lg font-bold text-[#091426] mr-4">حسابي</h1>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-[#1e293b] flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-white text-4xl">person</span>
          </div>
          <h2 className="text-xl font-bold text-[#091426]">{session?.user?.name || "مستخدم"}</h2>
          <p className="text-gray-500 text-sm mt-1">{(session?.user as any)?.phone || ""}</p>
          <p className="text-gray-400 text-xs mt-1">زبون</p>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full bg-red-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
        >
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
          <Link key={it.href} href={it.href} className={`flex flex-col items-center px-3 py-1 ${it.label === "حسابي" ? "text-[#E05A2B]" : "text-gray-400"} hover:text-[#E05A2B]`}>
            <span className="material-symbols-outlined">{it.icon}</span>
            <span className="text-xs mt-1">{it.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
