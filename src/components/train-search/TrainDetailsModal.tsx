"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { UnifiedTrain } from "@/lib/trainData";
import { getTrainSchedule, getRealStopCount } from "@/lib/trainData";
import { Clock, MapPin, Zap, X, Users, Wind, MapIcon } from "lucide-react";
import { Chip } from "@/components/ui/chip";
import { TrainSchedule } from "./TrainSchedule";

const TrainRouteMap = dynamic(
  () => import("./TrainRouteMap").then((mod) => mod.TrainRouteMap),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-white/10 bg-black/20 p-8 text-center text-sm text-foreground/70">
        Loading route map...
      </div>
    ),
  }
);

type TrainDetailsModalProps = {
  train: UnifiedTrain | null;
  onClose: () => void;
};

export function TrainDetailsModal({ train, onClose }: TrainDetailsModalProps) {
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showMap) {
          setShowMap(false);
          return;
        }

        onClose();
      }
    };

    if (train) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "unset";
      };
    }
  }, [train, onClose, showMap]);

  if (!train) return null;

  const schedule = getTrainSchedule(train.number);
  const hasSchedule = schedule && schedule.length > 0;
  const totalStops = getRealStopCount(train.number);

  const getTypeColor = (type: string): "default" | "success" | "warn" | "danger" => {
    if (type.includes("SF") || type.includes("Superfast")) return "success";
    if (type.includes("DEMU")) return "warn";
    if (type.includes("Passenger")) return "danger";
    return "default";
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 md:p-6">
        <div
          className="glass w-full max-w-2xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-16 md:slide-in-from-bottom-0 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-r from-primary/15 via-primary/5 to-accent/10 p-4 md:p-6 backdrop-blur-md">
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="font-display text-xl md:text-2xl font-bold tracking-tight">{train.name || "Unknown Train"}</h2>
                <p className="mt-1 text-sm text-white/60">Train #{train.number || "N/A"}</p>
              </div>

              <div className="flex items-center gap-2 text-sm md:text-base font-semibold text-foreground/90">
                <span className="truncate">{train.fromName || "N/A"}</span>
                <ArrowIcon className="text-primary-soft shrink-0" />
                <span className="truncate">{train.toName || "N/A"}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Chip tone={getTypeColor(train.type)} className="px-2.5 py-1 text-xs md:text-sm">
                  {train.type || "N/A"}
                </Chip>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
                  <Clock size={12} className="mr-1.5 text-accent" />
                  {train.duration || "N/A"}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/0 transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:border-white/30 active:scale-95"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {/* Route & Basic Info */}
            <section className="space-y-4">
              <h3 className="font-display text-lg font-bold">Journey Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Route */}
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <p className="text-xs font-semibold text-foreground/60 uppercase mb-2">Route</p>
                  <div className="flex items-center gap-2 font-semibold mb-3">
                    <span className="text-lg">{train.fromName || "N/A"}</span>
                    <ArrowIcon className="text-primary-soft" />
                    <span className="text-lg">{train.toName || "N/A"}</span>
                  </div>
                  <p className="text-xs text-foreground/60">
                    ({train.from} → {train.to})
                  </p>
                </div>

                {/* Type Badge */}
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <p className="text-xs font-semibold text-foreground/60 uppercase mb-2">Train Type</p>
                  <Chip tone={getTypeColor(train.type)} className="text-base py-2 px-3">
                    {train.type || "N/A"}
                  </Chip>
                </div>
              </div>

              {/* Timing & Distance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-primary-soft" />
                    <p className="text-xs font-semibold text-foreground/60 uppercase">Departure</p>
                  </div>
                  <p className="font-display text-lg font-bold">{train.departure || "N/A"}</p>
                </div>

                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-accent" />
                    <p className="text-xs font-semibold text-foreground/60 uppercase">Arrival</p>
                  </div>
                  <p className="font-display text-lg font-bold">{train.arrival || "N/A"}</p>
                </div>

                <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={16} className="text-cyan-400" />
                    <p className="text-xs font-semibold text-foreground/60 uppercase">Duration</p>
                  </div>
                  <p className="font-display text-lg font-bold">{train.duration || "N/A"}</p>
                </div>
              </div>

              {/* Extra Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {train.distance && (
                  <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-accent" />
                      <p className="text-xs font-semibold text-foreground/60 uppercase">Distance</p>
                    </div>
                    <p className="font-display text-lg font-bold">
                      {train.distance}
                      <span className="text-xs font-normal text-foreground/60 ml-1">km</span>
                    </p>
                  </div>
                )}

                {schedule && schedule.length > 0 && (
                  <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={16} className="text-primary-soft" />
                      <p className="text-xs font-semibold text-foreground/60 uppercase">Total Stops</p>
                    </div>
                    <p className="font-display text-lg font-bold">{totalStops}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Schedule */}
            {hasSchedule && (
              <section>
                <TrainSchedule 
                  stops={schedule} 
                  trainNumber={train.number}
                  fromStation={train.fromName}
                  toStation={train.toName}
                  headerAction={
                    <button
                      type="button"
                      onClick={() => setShowMap(true)}
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.25)] transition-all duration-200 hover:scale-[1.03] hover:from-blue-500 hover:to-cyan-400 active:scale-[0.97]"
                    >
                      <MapIcon className="h-4 w-4" />
                      View Route Map
                    </button>
                  }
                />
              </section>
            )}

            {/* Coach Layout Simulation */}
            <section className="space-y-4">
              <h3 className="font-display text-lg font-bold">Amenities & Coach Classes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sleeper */}
                <div className="rounded-xl border border-foreground/10 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-3 w-3 rounded-full bg-purple-500" />
                    <p className="font-semibold text-sm">Sleeper Class</p>
                  </div>
                  <CoachLayoutGrid rows={3} cols={6} color="purple" />
                  <p className="text-xs text-foreground/60 mt-3">Economical overnight travel</p>
                </div>

                {/* AC 2-Tier */}
                <div className="rounded-xl border border-foreground/10 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Wind size={16} className="text-blue-500" />
                    <p className="font-semibold text-sm">AC 2-Tier</p>
                  </div>
                  <CoachLayoutGrid rows={2} cols={6} color="blue" />
                  <p className="text-xs text-foreground/60 mt-3">Premium comfort with AC</p>
                </div>

                {/* General */}
                <div className="rounded-xl border border-foreground/10 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users size={16} className="text-amber-500" />
                    <p className="font-semibold text-sm">General Class</p>
                  </div>
                  <CoachLayoutGrid rows={4} cols={8} color="amber" />
                  <p className="text-xs text-foreground/60 mt-3">Budget-friendly option</p>
                </div>
              </div>

              <p className="text-xs text-foreground/60 border-t border-foreground/10 pt-4">
                * Coach layout is a simulation. Actual availability may vary. Visit booking page for real-time seat status.
              </p>
            </section>
          </div>
        </div>
      </div>

      {showMap && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowMap(false)}
        >
          <div
            className="w-full max-w-5xl rounded-2xl border border-white/10 bg-[#0b1220] p-4 md:p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-bold tracking-tight">Train Route Map</h2>
              <button
                type="button"
                onClick={() => setShowMap(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/5 hover:bg-white/10"
                aria-label="Close route map"
              >
                <X size={18} />
              </button>
            </div>

            <TrainRouteMap trainNumber={train.number} />
          </div>
        </div>
      )}
    </>
  );
}

function CoachLayoutGrid({
  rows,
  cols,
  color,
}: {
  rows: number;
  cols: number;
  color: "purple" | "blue" | "amber";
}) {
  const colorMap = {
    purple: "bg-purple-500/20 border-purple-500/40",
    blue: "bg-blue-500/20 border-blue-500/40",
    amber: "bg-amber-500/20 border-amber-500/40",
  };

  return (
    <div className="inline-grid gap-1.5 p-3 rounded-lg bg-foreground/5 border border-foreground/10">
      {Array.from({ length: rows }).map((_, i) =>
        Array.from({ length: cols }).map((_, j) => (
          <div
            key={`${i}-${j}`}
            className={`h-4 w-4 rounded-sm border ${colorMap[color]}`}
          />
        ))
      )}
    </div>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
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
