"use client";

import type { UnifiedTrain } from "@/lib/trainData";
import { Clock, MapPin, Zap } from "lucide-react";
import { Chip } from "@/components/ui/chip";

type TrainCardProps = {
  train: UnifiedTrain;
  onClick: (train: UnifiedTrain) => void;
};

export function TrainCard({ train, onClick }: TrainCardProps) {
  const getTypeColor = (type: string): "default" | "success" | "warn" | "danger" => {
    if (type.includes("SF") || type.includes("Superfast")) return "success";
    if (type.includes("DEMU")) return "warn";
    if (type.includes("Passenger")) return "danger";
    return "default";
  };

  return (
    <article
      onClick={() => onClick(train)}
      className="glass group relative overflow-hidden rounded-2xl border border-foreground/10 p-5 md:p-6 cursor-pointer transition duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/15 hover:scale-105"
    >
      {/* Glow effect on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
      </div>

      <div className="relative">
        {/* Header: Train Name and Type Badge */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h3 className="font-display text-lg font-bold tracking-tight">{train.name || "Unknown Train"}</h3>
            <p className="text-xs text-foreground/60 font-semibold">{train.number || "N/A"}</p>
          </div>
          <Chip tone={getTypeColor(train.type)}>{train.type || "N/A"}</Chip>
        </div>

        {/* Route */}
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <span className="truncate">{train.fromName || "N/A"}</span>
          <ArrowIcon className="flex-shrink-0 text-primary-soft" />
          <span className="truncate">{train.toName || "N/A"}</span>
        </div>

        {/* Journey Details */}
        <div className="space-y-3 mb-4">
          {/* Time */}
          <div className="flex items-center gap-3 text-sm">
            <Clock size={16} className="text-primary-soft flex-shrink-0" />
            <div>
              <p className="font-semibold">
                {train.departure} → {train.arrival}
              </p>
              <p className="text-xs text-foreground/60">
                Duration: <span className="font-medium">{train.duration}</span>
              </p>
            </div>
          </div>

          {/* Distance */}
          {train.distance && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-accent flex-shrink-0" />
              <span>
                <span className="font-medium">{train.distance}</span>
                <span className="text-foreground/60 ml-1">km</span>
              </span>
            </div>
          )}

          {/* Stops */}
          {train.stops && train.stops.length > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <Zap size={16} className="text-cyan-400 flex-shrink-0" />
              <span>
                <span className="font-medium">{train.stops.length}</span>
                <span className="text-foreground/60 ml-1">stops</span>
              </span>
            </div>
          )}
        </div>

        {/* Footer: CTA */}
        <div className="pt-3 border-t border-foreground/10">
          <button
            type="button"
            className="text-xs font-semibold text-primary-soft transition hover:text-primary-soft/80"
            onClick={(e) => {
              e.stopPropagation();
              onClick(train);
            }}
          >
            View Details →
          </button>
        </div>
      </div>
    </article>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M13 8L10 5M13 8L10 11M13 8H3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
