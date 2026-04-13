"use client";

import { ArrowRight, Sparkles } from "lucide-react";

type GetStartedHeroProps = {
  onGetStarted: () => void;
};

export function GetStartedHero({ onGetStarted }: GetStartedHeroProps) {
  return (
    <section className="glass relative mt-6 overflow-hidden rounded-3xl border border-white/10 px-6 py-8 shadow-lg md:px-8 md:py-10">
      {/* Animated gradient background */}
      <style>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .gradient-animate {
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
      `}</style>
      
      <div className="pointer-events-none absolute inset-0 gradient-animate rounded-3xl bg-[linear-gradient(120deg,rgba(35,69,178,0.35)_0%,rgba(29,165,150,0.28)_50%,rgba(35,69,178,0.32)_100%)]" />
      <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-500/35 blur-3xl opacity-60" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-cyan-400/35 blur-3xl opacity-60" />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-400/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">
            <Sparkles size={14} className="mr-2" />
            Smart Onboarding
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">Welcome to Railverse</h2>
          <p className="mt-3 text-base text-foreground/70 md:text-lg">
            Smarter railway experience powered by TravelCore
          </p>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onGetStarted}
            className="group relative inline-flex items-center rounded-xl bg-primary px-7 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(58,105,255,0.55)] active:scale-95"
          >
            {/* Glow effect on hover */}
            <span className="absolute inset-0 rounded-xl bg-primary opacity-0 blur-lg transition-opacity duration-300 group-hover:opacity-100" />
            <span className="relative inline-flex items-center">
              Get Started
              <ArrowRight size={15} className="ml-2.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}