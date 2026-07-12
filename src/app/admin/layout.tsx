"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

const LINKS = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: "grid_view" },
  { section: "طلبات التسجيل" },
  { href: "/admin/customers", label: "طلبات الزبائن", icon: "person_add" },
  { href: "/admin/drivers", label: "طلبات السائقين", icon: "local_shipping" },
  { section: "الإدارة" },
  { href: "/admin/users", label: "المستخدمين", icon: "group" },
  { href: "/admin/trips", label: "الرحلات", icon: "route" },
  { section: "النظام" },
  { href: "/admin/payments", label: "المدفوعات", icon: "payments" },
  { href: "/admin/settings", label: "الإعدادات", icon: "settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface h-screen flex flex-col md:flex-row-reverse overflow-hidden">
      {/* Mobile Header */}
      <header className="md:hidden flex flex-row-reverse justify-between items-center w-full px-4 h-16 bg-surface-container-lowest border-b border-outline-variant shadow-sm z-50 shrink-0">
        <button onClick={() => setSidebarOpen(true)} className="material-symbols-outlined text-primary p-2 hover:bg-surface-container rounded-full">
          menu
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">B2B Driver</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
          <span className="material-symbols-outlined">person</span>
        </div>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 right-0 z-40 w-72 bg-primary text-white transition-transform duration-300 md:relative md:translate-x-0 flex flex-col border-l border-outline-variant ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3 shrink-0">
          <span className="text-2xl font-extrabold text-secondary-container">B2B Driver</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {LINKS.map((link, i) =>
            "section" in link ? (
              <div key={i} className="pt-4 pb-1 first:pt-0">
                <span className="px-4 text-xs font-bold text-white/40 uppercase tracking-widest">
                  {link.section}
                </span>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href!}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                  pathname === link.href
                    ? "bg-secondary-container text-white font-semibold"
                    : "text-on-primary-container hover:bg-white/10"
                }`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ),
          )}
        </nav>
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 text-on-primary-container hover:text-white transition-colors w-full p-3"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">تسجيل الخروج</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-surface-container-low p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
