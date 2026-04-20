"use client";

import { useState, useMemo, type ReactNode } from "react";
import type { TrainStop } from "@/lib/trainData";
import { getRealStopCount } from "@/lib/trainData";
import { Clock, Circle, ChevronDown } from "lucide-react";

type TrainScheduleProps = {
  stops: TrainStop[];
  trainNumber: string;
  fromStation?: string;
  toStation?: string;
  headerAction?: ReactNode;
};

type ScheduleItem = {
  type: "major" | "noHalt";
  isMajor: boolean;
  isSource: boolean;
  isDestination: boolean;
  dayStart: number;
  dayEnd: number;
  stopIndex?: number;
  groupStartIndex?: number;
  stop?: TrainStop;
  stopsGroup?: TrainStop[];
  groupCount?: number;
};

export function TrainSchedule({
  stops,
  trainNumber,
  fromStation,
  toStation,
  headerAction,
}: TrainScheduleProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());

  if (!stops || stops.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-sm text-foreground/60">No schedule information available</p>
      </div>
    );
  }

  const isSourceStation = (index: number): boolean => {
    return index === 0;
  };

  const isDestinationStation = (index: number): boolean => {
    return index === stops.length - 1;
  };

  const hasHaltTime = (stop: TrainStop): boolean => {
    return stop.isHalt && !!stop.arrival && !!stop.departure && stop.arrival !== stop.departure;
  };

  const parseScheduleTimeToMinutes = (timeStr: string | null): number | null => {
    if (!timeStr || timeStr === "N/A") return null;
    const parts = timeStr.split(":");
    if (parts.length !== 2) return null;

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return hours * 60 + minutes;
  };

  const parseTime = (timeStr: string | null): number => {
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

  const stopDayNumbers = useMemo(() => {
    let currentDay = 1;
    const dayNumbers = new Array<number>(stops.length).fill(1);

    for (let i = 0; i < stops.length; i++) {
      if (i === 0) {
        dayNumbers[i] = 1;
        continue;
      }

      const prev = stops[i - 1];
      const curr = stops[i];
      const prevMinutes = parseScheduleTimeToMinutes(prev?.departure ?? null);
      const currMinutes = parseScheduleTimeToMinutes(curr?.arrival ?? null);

      if (prevMinutes !== null && currMinutes !== null && currMinutes < prevMinutes) {
        currentDay += 1;
      }

      dayNumbers[i] = currentDay;
    }

    return dayNumbers;
  }, [stops]);

  const scheduleItems = useMemo(() => {
    const items: ScheduleItem[] = [];
    let i = 0;

    while (i < stops.length) {
      const stop = stops[i];
      const isSource = isSourceStation(i);
      const isDestination = isDestinationStation(i);
      const isMajorStop = isSource || isDestination || hasHaltTime(stop);

      if (isMajorStop) {
        items.push({
          type: "major",
          isMajor: true,
          isSource,
          isDestination,
          dayStart: stopDayNumbers[i] ?? 1,
          dayEnd: stopDayNumbers[i] ?? 1,
          stopIndex: i,
          stop,
        });
        i++;
      } else {
        const groupStartIndex = i;
        const noHaltGroup: TrainStop[] = [];
        while (i < stops.length) {
          const currentStop = stops[i];
          const currentIsSource = isSourceStation(i);
          const currentIsDestination = isDestinationStation(i);
          const currentIsMajor = currentIsSource || currentIsDestination || hasHaltTime(currentStop);

          if (currentIsMajor) {
            break;
          }

          noHaltGroup.push(currentStop);
          i++;
        }

        if (noHaltGroup.length > 0) {
          const groupEndIndex = i - 1;
          items.push({
            type: "noHalt",
            isMajor: false,
            isSource: false,
            isDestination: false,
            dayStart: stopDayNumbers[groupStartIndex] ?? 1,
            dayEnd: stopDayNumbers[groupEndIndex] ?? 1,
            groupStartIndex,
            stopsGroup: noHaltGroup,
            groupCount: noHaltGroup.length,
          });
        }
      }
    }

    return items;
  }, [stops, stopDayNumbers]);

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
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="font-display text-lg font-bold tracking-tight">Full Schedule</h3>
          <p className="text-xs text-foreground/60">{haltingStationCount} stops</p>
        </div>

        {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
      </div>

      <div className="h-px w-full bg-white/10" />

      <div className="glass rounded-2xl p-3 md:p-6">
        {(() => {
          let stopCounter = 1;
          let lastRenderedDay = 0;
          return scheduleItems.map((item, itemIndex) => {
            const shouldRenderDayHeader = item.dayStart > lastRenderedDay;
            const dayHeader = shouldRenderDayHeader ? (
              <div className="mb-4 flex items-center gap-3" key={`day-header-${itemIndex}-${item.dayStart}`}>
                <span className="inline-flex items-center rounded-full border border-cyan-300/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.2)]">
                  Day {item.dayStart}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-cyan-400/30 to-transparent" />
              </div>
            ) : null;

            lastRenderedDay = Math.max(lastRenderedDay, item.dayEnd);

            if (item.type === "major" && item.stop) {
              const stop = item.stop;
              const isLast = itemIndex === scheduleItems.length - 1;
              const majorStopLabel = item.isSource
                ? "Source"
                : item.isDestination
                  ? "Destination"
                  : `Stop ${stopCounter++}`;
              const stopDay = item.dayStart;

            return (
              <div key={`major-${stop.stationCode}-${itemIndex}`}>
                {dayHeader}
                <div className="relative pb-6 md:pb-8 last:pb-0">
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
                          </p>
                        </div>

                        <div className="md:w-[34%]">
                          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs md:text-sm font-medium text-foreground/90">
                            <Clock size={14} className="text-primary-soft/80" />
                            <span className="font-semibold">{stop.arrival && stop.arrival !== "N/A" ? stop.arrival : "--:--"}</span>
                            <span className="text-foreground/50">→</span>
                            <span className="font-semibold">{stop.departure && stop.departure !== "N/A" ? stop.departure : "--:--"}</span>
                          </div>
                          <div className="mt-2 space-y-1">
                            {hasHaltTime(stop) && (
                              <p className="text-xs text-foreground/65">{calculateHaltDuration(stop)} min stop</p>
                            )}
                            {stop.distanceFromSource !== null && (
                              <p className="text-xs text-foreground/50">
                                {item.isSource ? (
                                  `${stop.distanceFromSource} km from source`
                                ) : (
                                  <>
                                    {stop.distanceFromSource} km from source • <span className="text-foreground/60 font-medium">+{stop.segmentFromLastStop ?? 0} km</span> from last stop
                                  </>
                                )}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="md:w-[28%] md:text-right space-y-2">
                          <span className="inline-flex rounded-full border border-blue-300/30 bg-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-200 shadow-[0_0_14px_rgba(59,130,246,0.2)]">
                            Day {stopDay}
                          </span>
                          <div>
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
                </div>
              </div>
            );
          } else if (item.type === "noHalt" && item.stopsGroup) {
            const isExpanded = expandedGroups.has(itemIndex);
            const isLast = itemIndex === scheduleItems.length - 1;
            const groupStartIndex = item.groupStartIndex ?? 0;

            return (
              <div key={`group-${itemIndex}`}>
                {dayHeader}
                <div className="relative">
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
                            {item.stopsGroup.map((stop, stopIndex) => {
                              const globalStopIndex = groupStartIndex + stopIndex;
                              const stopDay = stopDayNumbers[globalStopIndex] ?? 1;
                              const previousStopDay =
                                globalStopIndex > 0 ? (stopDayNumbers[globalStopIndex - 1] ?? stopDay) : stopDay;
                              const showInnerDayMarker = stopDay !== previousStopDay;

                              return (
                                <div key={`noHalt-${stop.stationCode}-${stopIndex}`} className="text-xs">
                                  {showInnerDayMarker && (
                                    <div className="mb-2 mt-1 flex items-center gap-2">
                                      <span className="inline-flex items-center rounded-full border border-blue-300/30 bg-blue-500/20 px-2 py-0.5 text-[11px] font-semibold text-blue-200">
                                        Day {stopDay}
                                      </span>
                                      <div className="h-px flex-1 bg-blue-300/25" />
                                    </div>
                                  )}
                                  <div className="flex items-start gap-2">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-white/25 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <p className="truncate font-medium text-foreground/85">
                                          {stop.stationName}
                                          {stop.stationCode && (
                                            <span className="text-foreground/50 ml-1">
                                              ({stop.stationCode})
                                            </span>
                                          )}
                                        </p>
                                        <span className="inline-flex rounded-full border border-blue-300/25 bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-200/90">
                                          Day {stopDay}
                                        </span>
                                      </div>
                                      {stop.arrival && stop.departure && stop.arrival !== "N/A" && stop.departure !== "N/A" && (
                                        <div className="mt-0.5 space-y-0.5">
                                          <p className={stop.isInterpolated ? "text-foreground/40 italic" : "text-foreground/60"}>
                                            {stop.arrival} / {stop.departure}
                                          </p>
                                          {stop.isInterpolated && (
                                            <p
                                              className="text-xs text-gray-400 italic"
                                              title="Train passes without stopping"
                                            >
                                              ↳ No halt • {stop.arrival}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                      {stop.distanceFromSource !== null && (
                                        <p className="text-xs text-foreground/40 mt-1">
                                          +{stop.segmentFromLastStop ?? 0} km from last stop • {stop.distanceFromSource} km total
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
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
