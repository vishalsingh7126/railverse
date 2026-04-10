"use client";

import { ArrowRight, Sparkles } from "lucide-react";

type GetStartedHeroProps = {
  onGetStarted: () => void;
};

export function GetStartedHero({ onGetStarted }: GetStartedHeroProps) {
  return (
    <section className="glass relative overflow-hidden rounded-3xl border border-foreground/10 p-6 shadow-[0_14px_46px_rgba(0,0,0,0.28)] md:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(35,69,178,0.3)_0%,rgba(13,30,56,0.55)_45%,rgba(29,165,150,0.24)_100%)]" />
      <div className="pointer-events-none absolute -left-24 -top-24 h-52 w-52 rounded-full bg-blue-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-28 h-56 w-56 rounded-full bg-cyan-400/30 blur-3xl" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-cyan-200">
            <Sparkles size={14} className="mr-2" />
            Smart Onboarding
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">Welcome to Railverse</h2>
          <p className="mt-2 text-base text-foreground/75 md:text-lg">
            Smarter railway experience powered by TravelCore
          </p>
        </div>

        <div className="flex items-center">
          <button
            type="button"
            onClick={onGetStarted}
            className="group inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_28px_rgba(58,105,255,0.45)] transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            Get Started
            <ArrowRight size={15} className="ml-2 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </section>
  );
}