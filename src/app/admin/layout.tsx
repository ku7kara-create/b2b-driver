"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: "grid_view" },
  { href: "/admin/customers", label: "طلبات الزبائن", icon: "person_add" },
  { href: "/admin/drivers", label: "طلبات السائقين", icon: "local_shipping" },
  { href: "/admin/users", label: "المستخدمين", icon: "group" },
  { href: "/admin/trips", label: "الرحلات", icon: "route" },
  { href: "/admin/payments", label: "المدفوعات", icon: "payments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col md:flex-row-reverse overflow-hidden">
      <header className="md:hidden flex flex-row-reverse justify-between items-center w-full px-4 h-16 bg-white border-b border-gray-200 shrink-0 z-50">
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-full">
          <span className="material-symbols-outlined text-[#091426]">menu</span>
        </button>
        <span className="text-xl font-bold text-[#091426]">B2B Driver</span>
        <div className="w-10 h-10 rounded-full bg-[#1e293b] flex items-center justify-center text-white">
          <span className="material-symbols-outlined">person</span>
        </div>
      </header>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 right-0 z-40 w-64 bg-[#091426] text-white transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
          <span className="text-2xl font-extrabold text-[#E05A2B]">B2B Driver</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === link.href ? "bg-[#E05A2B] text-white font-semibold" : "text-gray-400 hover:bg-white/10"}`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span className="text-sm">{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full p-3 text-sm">
            <span className="material-symbols-outlined">logout</span>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
