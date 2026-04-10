"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Brain,
  ChartNoAxesCombined,
  CircleUserRound,
  LayoutDashboard,
  Shield,
  Signal,
  Ticket,
  Train,
  Truck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/train-search", label: "Search", icon: Train },
  { href: "/book-tickets", label: "Book", icon: Ticket },
  { href: "/live-status", label: "Live", icon: Signal },
  { href: "/parcel-freight", label: "Freight", icon: Truck },
  { href: "/ai-planner", label: "AI", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/simulation", label: "Sim", icon: Activity },
  { href: "/safety", label: "Safety", icon: Shield },
  { href: "/community", label: "Community", icon: Users },
  { href: "/settings", label: "Settings", icon: CircleUserRound },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="glass fixed bottom-3 left-3 right-3 z-40 rounded-2xl px-2 py-1.5 lg:hidden">
      <div className="flex items-center justify-between gap-1 overflow-x-auto">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "inline-flex min-w-[64px] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[11px]",
                active ? "bg-blue-500/20 text-blue-700 dark:text-blue-200" : "text-foreground/70",
              )}
            >
              <Icon size={14} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
