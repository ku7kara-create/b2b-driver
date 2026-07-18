"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/driver/dashboard", icon: "dashboard", label: "الرئيسية" },
  { href: "/driver/bid", icon: "local_shipping", label: "العروض" },
  { href: "/driver/subscription", icon: "credit_card", label: "المحفظة" },
  { href: "/driver/profile", icon: "person", label: "الحساب" },
];

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F9F9F9] pb-16">
      {children}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex flex-row-reverse justify-around items-center py-2 shadow-sm z-50">
        {NAV.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link key={it.href} href={it.href}
              className={`flex flex-col items-center px-3 py-1 rounded-xl ${active ? "bg-[#E05A2B] text-white" : "text-gray-400 hover:text-[#E05A2B]"}`}
            >
              <span className="material-symbols-outlined">{it.icon}</span>
              <span className="text-xs mt-1">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
