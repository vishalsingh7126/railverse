"use client";

import Image from "next/image";
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

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/train-search", label: "Train Search", icon: Train },
  { href: "/book-tickets", label: "Book Tickets", icon: Ticket },
  { href: "/live-status", label: "Live Status", icon: Signal },
  { href: "/parcel-freight", label: "Parcel & Freight", icon: Truck },
  { href: "/ai-planner", label: "AI Planner", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { href: "/simulation", label: "Simulation", icon: Activity },
  { href: "/safety", label: "Safety", icon: Shield },
  { href: "/community", label: "Community", icon: Users },
  { href: "/settings", label: "Profile / Settings", icon: CircleUserRound },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass rail-grid sticky top-4 hidden h-[calc(100vh-2rem)] w-72 shrink-0 overflow-y-auto rounded-3xl p-4 lg:block">
      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-foreground/5 p-3">
        <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 via-slate-950/60 to-cyan-400/15 p-1.5 shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
          <Image
            src="/logo-icon.png"
            alt="Railverse"
            width={40}
            height={40}
            sizes="40px"
            className="h-full w-full object-contain"
          />
        </div>
        <div>
          <p className="font-display text-lg font-bold tracking-tight">Railverse</p>
          <p className="text-xs text-foreground/65">A TravelCore Product</p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/25"
                  : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground",
              )}
            >
              <Icon size={17} className={cn(active ? "text-white" : "text-foreground/65")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
