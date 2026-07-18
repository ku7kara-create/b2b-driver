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
    <div className="min-h-screen bg-[#F9F9F9] pb-20">
      {children}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex flex-row-reverse justify-around items-center py-2 shadow-sm z-50">
        {NAV.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link key={it.href} href={it.href}
              className="flex flex-col items-center px-3 py-1 rounded-xl"
              style={{
                color: active ? "#ffffff" : "#9ca3af",
                backgroundColor: active ? "#E05A2B" : "transparent",
              }}
            >
              <span className="material-symbols-outlined text-lg">{it.icon}</span>
              <span className="text-xs mt-0.5">{it.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
