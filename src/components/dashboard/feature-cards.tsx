"use client";

import type { LucideIcon } from "lucide-react";
import { Bot, Ticket, TimerReset } from "lucide-react";

type FeatureCardsProps = {
  onAction: (title: string) => void;
};

type Feature = {
  title: string;
  description: string;
  cta: string;
  Icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Book Tickets Faster",
    description: "Save passengers, autofill details, and book instantly",
    cta: "Get Started",
    Icon: Ticket,
  },
  {
    title: "AI Travel Planner",
    description: "Smart suggestions for routes, timing, and comfort",
    cta: "Try Now",
    Icon: Bot,
  },
  {
    title: "Track & Save Journeys",
    description: "Monitor trips and get real-time alerts",
    cta: "Unlock",
    Icon: TimerReset,
  },
];

export function FeatureCards({ onAction }: FeatureCardsProps) {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {features.map(({ title, description, cta, Icon }) => (
        <article
          key={title}
          className="glass group relative overflow-hidden rounded-2xl border border-foreground/10 p-5 transition duration-300 hover:-translate-y-1 hover:border-primary/40"
        >
          <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-cyan-400/20 blur-2xl" />
          </div>

          <div className="relative">
            <div className="mb-4 inline-flex rounded-xl border border-primary/30 bg-primary/10 p-2.5 text-primary-soft">
              <Icon size={18} />
            </div>
            <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-foreground/70">{description}</p>
            <button
              type="button"
              onClick={() => onAction(title)}
              className="mt-5 inline-flex rounded-lg border border-primary/40 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-soft transition hover:bg-primary/25"
            >
              {cta}
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}