"use client";

import type { TrainStop } from "@/lib/trainData";
import { Clock, Circle } from "lucide-react";

type TrainScheduleProps = {
  stops: TrainStop[];
  fromStation?: string;
  toStation?: string;
};

export function TrainSchedule({ stops, fromStation, toStation }: TrainScheduleProps) {
  if (!stops || stops.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-foreground/60">No schedule information available</p>
      </div>
    );
  }

  const isSourceStation = (stop: TrainStop, source?: string) => {
    if (!source) return stop.stopNumber === 1;
    return stop.stationName.toLowerCase() === source.toLowerCase() ||
           stop.stationCode.toLowerCase() === source.toLowerCase();
  };

  const isDestinationStation = (stop: TrainStop, destination?: string) => {
    if (!destination) return stop.stopNumber === stops.length;
    return stop.stationName.toLowerCase() === destination.toLowerCase() ||
           stop.stationCode.toLowerCase() === destination.toLowerCase();
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold tracking-tight">Full Schedule</h3>
        <p className="text-xs text-foreground/60 mt-1">{stops.length} stops</p>
      </div>

      {/* Timeline View */}
      <div className="glass rounded-2xl p-6 space-y-1">
        {stops.map((stop, index) => {
          const isSource = isSourceStation(stop, fromStation);
          const isDestination = isDestinationStation(stop, toStation);
          const isLast = index === stops.length - 1;

          return (
            <div key={`${stop.stationCode}-${index}`} className="relative">
              {/* Timeline Line */}
              {!isLast && (
                <div className="absolute left-7 top-12 h-12 w-0.5 bg-gradient-to-b from-primary/60 to-primary/20" />
              )}

              {/* Stop Content */}
              <div className="relative pl-20">
                {/* Station Circle */}
                <div className="absolute left-0 top-2">
                  {isSource ? (
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-pulse" />
                      <div className="relative h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
                    </div>
                  ) : isDestination ? (
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-pulse" />
                      <div className="relative h-4 w-4 rounded-full bg-rose-500 border-2 border-background" />
                    </div>
                  ) : (
                    <Circle size={16} className="text-primary/60" fill="currentColor" />
                  )}
                </div>

                {/* Stop Details */}
                <div className={`rounded-xl p-3 transition ${
                  isSource
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : isDestination
                      ? "bg-rose-500/10 border border-rose-500/20"
                      : "border border-foreground/10 hover:border-foreground/20"
                }`}>
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {stop.stationName}
                        {stop.stationCode && (
                          <span className="text-xs font-normal text-foreground/60 ml-2">
                            ({stop.stationCode})
                          </span>
                        )}
                      </p>
                      {stop.stationState && (
                        <p className="text-xs text-foreground/50">{stop.stationState}</p>
                      )}
                    </div>
                    <div className="text-xs font-medium text-foreground/70">
                      Stop {stop.stopNumber}
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex items-center gap-6 text-xs">
                    {stop.arrival !== "N/A" && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-primary-soft/60" />
                        <span>
                          Arr: <span className="font-semibold">{stop.arrival}</span>
                        </span>
                      </div>
                    )}
                    {stop.departure !== "N/A" && (
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-accent/60" />
                        <span>
                          Dep: <span className="font-semibold">{stop.departure}</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-foreground/70">Source</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-rose-500" />
          <span className="text-foreground/70">Destination</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary/60" />
          <span className="text-foreground/70">Regular Stop</span>
        </div>
      </div>
    </section>
  );
}
