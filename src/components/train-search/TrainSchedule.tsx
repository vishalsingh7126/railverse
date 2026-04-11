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
    <section className="space-y-4">
      <div>
        <h3 className="font-display text-lg font-bold tracking-tight">Full Schedule</h3>
        <p className="text-xs text-foreground/60 mt-1">{haltingStationCount} stops</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-1">
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
              <div key={`major-${stop.stationCode}-${itemIndex}`} className="relative">
                {!isLast && (
                  <div className="absolute left-7 top-12 h-12 w-0.5 bg-gradient-to-b from-primary/60 to-primary/20" />
                )}

                <div className="relative pl-20">
                  <div className="absolute left-0 top-2">
                    {item.isSource ? (
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-pulse" />
                        <div className="relative h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
                      </div>
                    ) : item.isDestination ? (
                      <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-rose-500/30 animate-pulse" />
                        <div className="relative h-4 w-4 rounded-full bg-rose-500 border-2 border-background" />
                      </div>
                    ) : (
                      <div className="relative h-4 w-4 rounded-full bg-primary/80 border-2 border-background" />
                    )}
                  </div>

                  <div
                    className={`rounded-xl p-3 transition ${
                      item.isSource
                        ? "bg-emerald-500/10 border border-emerald-500/20"
                        : item.isDestination
                          ? "bg-rose-500/10 border border-rose-500/20"
                          : "border border-foreground/10 hover:border-foreground/20"
                    }`}
                  >
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
                      <div className="text-xs font-medium text-foreground/70">{majorStopLabel}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs">
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
                      {hasHaltTime(stop) && (
                        <div className="text-foreground/60 ml-auto">
                          <span className="text-xs">Halt: {calculateHaltDuration(stop)} min</span>
                        </div>
                      )}
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
                    className={`absolute left-7 top-12 w-0.5 transition-all duration-300 bg-gradient-to-b from-primary/40 to-primary/10 ${
                      isExpanded ? "h-auto" : "h-12"
                    }`}
                    style={{
                      height: isExpanded ? `${24 + item.stopsGroup.length * 32}px` : "48px",
                    }}
                  />
                )}

                <div className="relative pl-20">
                  <div className="absolute left-0 top-2">
                    <Circle size={16} className="text-foreground/40" fill="currentColor" />
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleGroup(itemIndex)}
                    className="w-full text-left rounded-xl border border-foreground/10 bg-foreground/5 px-3 py-2.5 text-xs font-medium text-foreground/70 transition hover:border-foreground/20 hover:bg-foreground/10 active:scale-95"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{item.groupCount} No-Halt Stations</span>
                      <ChevronDown
                        size={16}
                        className={`flex-shrink-0 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 border-l border-foreground/10 pl-4 py-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      {item.stopsGroup.map((stop, stopIndex) => (
                        <div key={`noHalt-${stop.stationCode}-${stopIndex}`} className="text-xs">
                          <div className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-foreground/30 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="font-medium text-foreground/80">
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
                  )}
                </div>
              </div>
            );
          }

              return null;

          });
        })()}
      </div>

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
          <div className="h-3 w-3 rounded-full bg-primary/80" />
          <span className="text-foreground/70">Major Stop</span>
        </div>
      </div>
    </section>
  );
}
