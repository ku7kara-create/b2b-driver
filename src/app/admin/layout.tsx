"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/admin/dashboard", label: "الرئيسية", icon: "grid_view" },
  { href: "/admin/users", label: "المستخدمين", icon: "group" },
  { href: "/admin/drivers", label: "السائقين", icon: "local_shipping" },
  { href: "/admin/trips", label: "الرحلات", icon: "route" },
  { href: "/admin/payments", label: "المدفوعات", icon: "payments" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-row-reverse bg-[#F9F9F9]">
      {/* Mobile toggle */}
      <button onClick={() => setOpen(true)} className="md:hidden fixed top-4 right-4 z-50 bg-white p-2 rounded-lg shadow border border-gray-200">
        <span className="material-symbols-outlined text-[#091426]">menu</span>
      </button>

      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed md:sticky inset-y-0 right-0 z-40 w-64 bg-[#091426] text-white flex flex-col transition-transform md:translate-x-0 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div style={{ backgroundColor: "#FF8C00" }} className="h-16 flex items-center px-5">
          <span className="text-xl font-bold" style={{ color: "white" }}>B2B Driver</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${pathname === item.href ? "bg-[#E05A2B] text-white" : "text-gray-400 hover:bg-white/10"}`}
            >
              <span className="material-symbols-outlined text-lg">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="flex items-center gap-3 text-gray-400 hover:text-white w-full p-2.5 text-sm">
            <span className="material-symbols-outlined">logout</span>
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
