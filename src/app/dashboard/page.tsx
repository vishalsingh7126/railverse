"use client";

import { useMemo, useState } from "react";
import { Activity, AlarmClockCheck, Gauge, PackageCheck, Route } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { GlassCard } from "@/components/ui/glass-card";
import { GetStartedHero } from "@/components/dashboard/get-started-hero";
import { FeatureCards } from "@/components/dashboard/feature-cards";
import { AuthModal } from "@/components/dashboard/auth-modal";

type AuthTab = "login" | "signup";

const AUTH_STORAGE_KEY = "railverse:isLoggedIn";
const AUTH_NAME_STORAGE_KEY = "railverse:userName";

const kpiCards = [
  { label: "Trains Running", value: "13,842", delta: "+2.4%", Icon: Gauge },
  { label: "Avg Delay Today", value: "14 min", delta: "-6.1%", Icon: AlarmClockCheck },
  { label: "Bookings Today", value: "2.18M", delta: "+9.8%", Icon: PackageCheck },
  { label: "Freight Tonnage", value: "5.9L", delta: "+4.3%", Icon: Activity },
] as const;

const corridorDemand = [
  { name: "NDLS-BCT", demand: 96000 },
  { name: "HWH-CSMT", demand: 81000 },
  { name: "MAS-SBC", demand: 52000 },
  { name: "CSMT-ADI", demand: 46000 },
  { name: "JP-ADI", demand: 37000 },
  { name: "BPL-NDLS", demand: 33000 },
] as const;

export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });
  const [userName, setUserName] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem(AUTH_NAME_STORAGE_KEY) ?? "";
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>("login");

  const showOnboarding = !isLoggedIn;

  const userInitials = useMemo(() => {
    if (!userName) {
      return "RV";
    }

    return userName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");
  }, [userName]);

  const openAuthModal = (tab: AuthTab) => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  const handleAuthSuccess = ({ name }: { name?: string }) => {
    setIsLoggedIn(true);
    if (name) {
      setUserName(name);
      localStorage.setItem(AUTH_NAME_STORAGE_KEY, name);
    }
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserName("");
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_NAME_STORAGE_KEY);
  };

  return (
    <>
      <AppShell
        title="Railverse Command Center"
        subtitle="Unified command for bookings, operations, analytics, and traveler safety"
        authState={{
          isLoggedIn,
          userName,
          userInitials,
          onLogoutClick: handleLogout,
        }}
      >
        {showOnboarding && <GetStartedHero onGetStarted={() => openAuthModal("signup")} />}

        {showOnboarding && <FeatureCards onAction={() => openAuthModal("signup")} />}

        <section id="dashboard-insights" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map(({ label, value, delta, Icon }) => (
            <GlassCard key={label} className="relative overflow-hidden p-5">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(20,44,118,0.28)_0%,rgba(8,20,44,0.3)_60%,rgba(10,84,101,0.2)_100%)]" />
              <div className="relative">
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-sm text-foreground/75">{label}</p>
                  <span className="inline-flex rounded-xl border border-primary/40 bg-primary/15 p-2 text-primary-soft">
                    <Icon size={16} />
                  </span>
                </div>
                <p className="font-display text-4xl font-bold tracking-tight">{value}</p>
                <p className="mt-2 text-sm font-semibold text-emerald-400">{delta} ↗</p>
              </div>
            </GlassCard>
          ))}
        </section>

        <GlassCard className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(5,34,69,0.42)_0%,rgba(4,18,37,0.52)_50%,rgba(3,56,66,0.35)_100%)]" />

          <div className="relative">
            <h3 className="font-display text-2xl font-semibold tracking-tight">Route Demand Snapshot</h3>
            <p className="mt-1 text-sm text-foreground/70">High-traffic corridors based on simulated booking volume</p>

            <div className="mt-6 rounded-2xl border border-foreground/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-foreground/80">
                <Route size={16} />
                <span className="text-sm font-semibold">Popular Corridors</span>
              </div>
              <div className="space-y-3">
                {corridorDemand.map((item) => {
                  const width = `${Math.max(18, Math.round((item.demand / 100000) * 100))}%`;
                  return (
                    <div key={item.name}>
                      <div className="mb-1 flex items-center justify-between text-xs text-foreground/70">
                        <span>{item.name}</span>
                        <span>{item.demand.toLocaleString()}</span>
                      </div>
                      <div className="h-2 rounded-full bg-foreground/10">
                        <div
                          className="h-full rounded-full bg-[linear-gradient(90deg,rgba(48,93,255,0.9),rgba(42,229,203,0.9))]"
                          style={{ width }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </GlassCard>
      </AppShell>

      <AuthModal
        key={isAuthOpen ? authTab : "closed"}
        isOpen={isAuthOpen}
        initialTab={authTab}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}
