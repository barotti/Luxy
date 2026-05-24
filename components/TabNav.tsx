"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/properties", label: "Proprietà", icon: "🏠" },
  { href: "/bookings", label: "Prenotazioni", icon: "🧾" },
  { href: "/new-booking", label: "Nuova Prenotazione", icon: "🗓️" },
  { href: "/reports", label: "Report", icon: "📊" },
  { href: "/settings", label: "Impostazioni", icon: "⚙️" },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-[#2A3040] bg-[#10141C]">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <div className="flex gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href || pathname.startsWith(tab.href + "/");
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                  isActive
                    ? "border-[#C9A75F] text-[#C9A75F]"
                    : "border-transparent text-[#A6A29A] hover:text-[#F4F0E6] hover:border-[#2A3040]"
                )}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
