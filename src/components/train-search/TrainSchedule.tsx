"use client";

import { useState, useMemo } from "react";
import type { TrainStop } from "@/lib/trainData";
import { getRealStopCount } from "@/lib/trainData";
import { Clock, Circle, ChevronDown } from "lucide-react";

type TrainScheduleProps = {
  stops: TrainStop[];
  trainNumber: string;
  fromStation?: string;
  toStation?: string;
};

type ScheduleItem = {
  type: "major" | "noHalt";
  isMajor: boolean;
  isSource: boolean;
  isDestination: boolean;
  stop?: TrainStop;
  stopsGroup?: TrainStop[];
  groupCount?: number;
};

export function TrainSchedule({ stops, trainNumber, fromStation, toStation }: TrainScheduleProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  if (!stops || stops.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-foreground/60">No schedule information available</p>
      </div>
    );
  }

  const isSourceStation = (stop: TrainStop): boolean => {
    return stop.stopNumber === 1;
  };

  const isDestinationStation = (stop: TrainStop): boolean => {
    return stop.stopNumber === stops.length;
  };

  const hasHaltTime = (stop: TrainStop): boolean => {
    return stop.arrival !== stop.departure && stop.arrival !== "N/A" && stop.departure !== "N/A";
  };

  const parseTime = (timeStr: string): number => {
    if (!timeStr || timeStr === "N/A") return 0;
    const parts = timeStr.split(":");
    if (parts.length < 2) return 0;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    return isNaN(hours) || isNaN(minutes) ? 0 : hours * 60 + minutes;
  };

  const calculateHaltDuration = (stop: TrainStop): number => {
    if (!hasHaltTime(stop)) return 0;
    const arrivalMinutes = parseTime(stop.arrival);
    const departureMinutes = parseTime(stop.departure);
    if (arrivalMinutes === 0 || departureMinutes === 0) return 0;
    const duration = departureMinutes - arrivalMinutes;
    return duration > 0 ? duration : 0;
  };

  const haltingStationCount = useMemo(() => getRealStopCount(trainNumber), [trainNumber]);

  const scheduleItems = useMemo(() => {
    const items: ScheduleItem[] = [];
    let i = 0;

    while (i < stops.length) {
      const stop = stops[i];
      const isSource = isSourceStation(stop);
      const isDestination = isDestinationStation(stop);
      const isMajorStop = isSource || isDestination || hasHaltTime(stop);

      if (isMajorStop) {
        items.push({
          type: "major",
          isMajor: true,
          isSource,
          isDestination,
          stop,
        });
        i++;
      } else {
        const noHaltGroup: TrainStop[] = [];
        while (i < stops.length) {
          const currentStop = stops[i];
          const currentIsSource = isSourceStation(currentStop);
          const currentIsDestination = isDestinationStation(currentStop);
          const currentIsMajor = currentIsSource || currentIsDestination || hasHaltTime(currentStop);

          if (currentIsMajor) {
            break;
          }

          noHaltGroup.push(currentStop);
          i++;
        }

        if (noHaltGroup.length > 0) {
          items.push({
            type: "noHalt",
            isMajor: false,
            isSource: false,
            isDestination: false,
            stopsGroup: noHaltGroup,
            groupCount: noHaltGroup.length,
          });
        }
      }
    }

    return items;
  }, [stops]);

  const toggleGroup = (groupIndex: number) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupIndex)) {
      newExpanded.delete(groupIndex);
    } else {
      newExpanded.add(groupIndex);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <section className="space-y-6 md:space-y-8">
      <div className="space-y-1.5">
        <h3 className="font-display text-lg font-bold tracking-tight">Full Schedule</h3>
        <p className="text-xs text-foreground/60">{haltingStationCount} stops</p>
      </div>

      <div className="h-px w-full bg-white/10" />

      <div className="glass rounded-2xl p-3 md:p-6">
        {(() => {
          let stopCounter = 1;
          return scheduleItems.map((item, itemIndex) => {
            if (item.type === "major" && item.stop) {
              const stop = item.stop;
              const isLast = itemIndex === scheduleItems.length - 1;
              const majorStopLabel = item.isSource
                ? "Source"
                : item.isDestination
                  ? "Destination"
                  : `Stop ${stopCounter++}`;

            return (
              <div key={`major-${stop.stationCode}-${itemIndex}`} className="relative pb-6 md:pb-8 last:pb-0">
                {!isLast && (
                  <div className="absolute left-4 top-9 bottom-0 w-px bg-gradient-to-b from-blue-500/30 via-blue-400/20 to-teal-500/30" />
                )}

                <div className="relative pl-10 md:pl-14">
                  <div className="absolute left-0 top-3">
                    {item.isSource ? (
                      <div className="relative">
                        <span className="absolute inset-0 rounded-full bg-green-400/40 blur-sm animate-pulse" />
                        <span className="relative block h-3.5 w-3.5 rounded-full border-2 border-background bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                      </div>
                    ) : item.isDestination ? (
                      <div className="relative">
                        <span className="absolute inset-0 rounded-full bg-red-400/40 blur-sm animate-pulse" />
                        <span className="relative block h-3.5 w-3.5 rounded-full border-2 border-background bg-red-400 shadow-[0_0_12px_rgba(248,113,113,0.8)]" />
                      </div>
                    ) : (
                      <div className="relative">
                        <span className="absolute inset-0 rounded-full bg-cyan-400/40 blur-sm animate-pulse" />
                        <span className="relative block h-3.5 w-3.5 rounded-full border-2 border-background bg-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
                      </div>
                    )}
                  </div>

                  <div
                    className={`rounded-2xl border bg-white/5 p-3 md:p-4 backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/10 hover:border-white/20 ${
                      item.isSource
                        ? "border-emerald-300/30 bg-emerald-400/10"
                        : item.isDestination
                          ? "border-rose-300/30 bg-rose-400/10"
                          : "border-white/10"
                    } ${itemIndex === 1 ? "ring-1 ring-cyan-300/30" : ""}`}
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 md:w-[38%]">
                        <p className="truncate text-sm md:text-base font-bold text-foreground/95">{stop.stationName}</p>
                        <p className="mt-1 text-xs text-foreground/60">
                          {stop.stationCode || "N/A"}
                          {stop.stationState ? ` • ${stop.stationState}` : ""}
                        </p>
                      </div>

                      <div className="md:w-[34%]">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs md:text-sm font-medium text-foreground/90">
                          <Clock size={14} className="text-primary-soft/80" />
                          <span className="font-semibold">{stop.arrival !== "N/A" ? stop.arrival : "--:--"}</span>
                          <span className="text-foreground/50">→</span>
                          <span className="font-semibold">{stop.departure !== "N/A" ? stop.departure : "--:--"}</span>
                        </div>
                        {hasHaltTime(stop) && (
                          <p className="mt-2 text-xs text-foreground/65">{calculateHaltDuration(stop)} min stop</p>
                        )}
                      </div>

                      <div className="md:w-[28%] md:text-right">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            item.isSource
                              ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
                              : item.isDestination
                                ? "border-rose-300/40 bg-rose-400/15 text-rose-100"
                                : "border-white/15 bg-white/5 text-foreground/80"
                          }`}
                        >
                          {majorStopLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else if (item.type === "noHalt" && item.stopsGroup) {
            const isExpanded = expandedGroups.has(itemIndex);
            const isLast = itemIndex === scheduleItems.length - 1;

            return (
              <div key={`group-${itemIndex}`} className="relative">
                {!isLast && (
                  <div
                      className={`absolute left-4 top-9 w-px bg-gradient-to-b from-blue-500/30 via-blue-400/20 to-teal-500/30 transition-all duration-300 ${
                      isExpanded ? "h-auto" : "h-14"
                    }`}
                    style={{
                      height: isExpanded ? `${34 + item.stopsGroup.length * 34}px` : "56px",
                    }}
                  />
                )}

                <div className="relative pb-6 md:pb-8 pl-10 md:pl-14">
                  <div className="absolute left-0 top-3">
                      <Circle size={14} className="text-white/30" fill="currentColor" />
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/10">
                    <button
                      type="button"
                      onClick={() => toggleGroup(itemIndex)}
                      className="w-full text-left px-3 py-3 md:px-4 md:py-3.5 text-xs md:text-sm font-medium text-foreground/75 transition hover:bg-white/5 active:scale-[0.99]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{item.groupCount} intermediate stations (no halt)</span>
                        <ChevronDown
                          size={16}
                          className={`flex-shrink-0 transition-transform duration-300 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    <div
                      className={`grid transition-all duration-300 ease-out ${
                        isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="mx-3 mb-3 md:mx-4 md:mb-4 space-y-2 border-l border-white/10 pl-3 md:pl-4 pt-1">
                          {item.stopsGroup.map((stop, stopIndex) => (
                            <div key={`noHalt-${stop.stationCode}-${stopIndex}`} className="text-xs">
                              <div className="flex items-start gap-2">
                                <div className="mt-1 h-2 w-2 rounded-full bg-white/25 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="truncate font-medium text-foreground/85">
                                    {stop.stationName}
                                    {stop.stationCode && (
                                      <span className="text-foreground/50 ml-1">
                                        ({stop.stationCode})
                                      </span>
                                    )}
                                  </p>
                                  {stop.arrival !== "N/A" && stop.departure !== "N/A" && (
                                    <p className="text-foreground/60 mt-0.5">
                                      {stop.arrival} / {stop.departure}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

              return null;

          });
        })()}
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <span>Source</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
            <span>Destination</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            <span>Major Stop</span>
          </div>
        </div>
      </div>
    </section>
  );
}
