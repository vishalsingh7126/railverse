"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { ArrowRightLeft, Search, TrainFront } from "lucide-react";
import type { StationData, UnifiedTrain } from "@/lib/trainData";
import { getAllStations, getAllTrains } from "@/lib/trainData";

type TrainSearchFormProps = {
  onSearch: (from: string, to: string, date: string) => void;
  onSelectTrain: (train: UnifiedTrain) => void;
  loading?: boolean;
};

type FieldType = "from" | "to" | "train";
type ActiveField = FieldType | null;

type SuggestionItem = {
  key: string;
  label: string;
  helper: string;
  value: string;
  train?: UnifiedTrain;
};

function buildStationSuggestions(query: string, stations: StationData[]): SuggestionItem[] {
  const normalized = query.trim().toUpperCase();
  if (!normalized) {
    return [];
  }

  return stations
    .filter((station) => {
      const code = station.code.toUpperCase();
      const name = station.name.toUpperCase();
      return code.includes(normalized) || name.includes(normalized);
    })
    .sort((left, right) => {
      const leftStarts =
        left.code.toUpperCase().startsWith(normalized) || left.name.toUpperCase().startsWith(normalized)
          ? 0
          : 1;
      const rightStarts =
        right.code.toUpperCase().startsWith(normalized) || right.name.toUpperCase().startsWith(normalized)
          ? 0
          : 1;

      if (leftStarts !== rightStarts) {
        return leftStarts - rightStarts;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, 8)
    .map((station) => ({
      key: station.code,
      label: `${station.code} - ${station.name}`,
      helper: station.state,
      value: station.code,
    }));
}

function buildTrainSuggestions(query: string, trains: UnifiedTrain[]): SuggestionItem[] {
  const normalized = query.trim().toUpperCase();
  if (!normalized) {
    return [];
  }

  return trains
    .filter((train) => {
      const number = train.number.toUpperCase();
      const name = train.name.toUpperCase();
      return number.includes(normalized) || name.includes(normalized);
    })
    .sort((left, right) => {
      const leftStarts =
        left.number.toUpperCase().startsWith(normalized) ||
        left.name.toUpperCase().startsWith(normalized)
          ? 0
          : 1;
      const rightStarts =
        right.number.toUpperCase().startsWith(normalized) ||
        right.name.toUpperCase().startsWith(normalized)
          ? 0
          : 1;

      if (leftStarts !== rightStarts) {
        return leftStarts - rightStarts;
      }

      return left.number.localeCompare(right.number);
    })
    .slice(0, 8)
    .map((train) => ({
      key: train.number,
      label: `${train.number} - ${train.name || "Unknown Train"}`,
      helper: train.fromName && train.toName ? `${train.fromName} → ${train.toName}` : train.type || "N/A",
      value: train.number,
      train,
    }));
}

export function TrainSearchForm({ onSearch, onSelectTrain, loading = false }: TrainSearchFormProps) {
  const [searchMode, setSearchMode] = useState<"route" | "train">("route");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [trainNumber, setTrainNumber] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState<SuggestionItem[]>([]);
  const [toSuggestions, setToSuggestions] = useState<SuggestionItem[]>([]);
  const [trainSuggestions, setTrainSuggestions] = useState<SuggestionItem[]>([]);
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [fromActiveIndex, setFromActiveIndex] = useState(0);
  const [toActiveIndex, setToActiveIndex] = useState(0);
  const [trainActiveIndex, setTrainActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const stations = useMemo(() => getAllStations(), []);
  const trains = useMemo(() => getAllTrains(), []);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setFromSuggestions([]);
    setToSuggestions([]);
    setActiveField(null);
  };

  const handleRouteSearch = () => {
    if (from.trim() && to.trim()) {
      onSearch(from.trim(), to.trim(), date);
    }
  };

  const handleTrainSearch = () => {
    const query = trainNumber.trim();
    if (!query) {
      return;
    }

    const normalized = query.toUpperCase();

    const exactMatch = trains.find(
      (train) =>
        train.number.toUpperCase() === normalized ||
        train.name.toUpperCase() === normalized,
    );

    const bestSuggestion = trainSuggestions[0]?.train;

    const fallbackMatch = trains.find(
      (train) =>
        train.number.toUpperCase().includes(normalized) ||
        train.name.toUpperCase().includes(normalized),
    );

    const selected = exactMatch ?? bestSuggestion ?? fallbackMatch;
    if (!selected) {
      return;
    }

    setTrainNumber(selected.number);
    setTrainSuggestions([]);
    setActiveField(null);
    onSelectTrain(selected);
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setActiveField(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFromSuggestions(buildStationSuggestions(from, stations));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [from, stations]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setToSuggestions(buildStationSuggestions(to, stations));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [to, stations]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setTrainSuggestions(buildTrainSuggestions(trainNumber, trains));
    }, 300);

    return () => window.clearTimeout(timer);
  }, [trainNumber, trains]);

  useEffect(() => {
    setFromActiveIndex(0);
  }, [fromSuggestions]);

  useEffect(() => {
    setToActiveIndex(0);
  }, [toSuggestions]);

  useEffect(() => {
    setTrainActiveIndex(0);
  }, [trainSuggestions]);

  const selectStationSuggestion = (field: "from" | "to" | "train", suggestion: SuggestionItem) => {
    if (field === "from") {
      setFrom(suggestion.value);
      setFromSuggestions([]);
    } else if (field === "to") {
      setTo(suggestion.value);
      setToSuggestions([]);
    }

    setActiveField(null);
  };

  const selectTrainSuggestion = (suggestion: SuggestionItem) => {
    if (!suggestion.train) {
      return;
    }

    setTrainNumber(suggestion.value);
    setTrainSuggestions([]);
    setActiveField(null);
    onSelectTrain(suggestion.train);
  };

  const handleFieldKeyDown = (field: FieldType, event: KeyboardEvent<HTMLInputElement>) => {
    const suggestions = field === "from" ? fromSuggestions : field === "to" ? toSuggestions : trainSuggestions;

    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setActiveField(field);
      if (field === "from") {
        setFromActiveIndex((current) => (current + 1) % suggestions.length);
      } else if (field === "to") {
        setToActiveIndex((current) => (current + 1) % suggestions.length);
      } else {
        setTrainActiveIndex((current) => (current + 1) % suggestions.length);
      }
      return;
    }

    if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setActiveField(field);
      if (field === "from") {
        setFromActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
      } else if (field === "to") {
        setToActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
      } else {
        setTrainActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
      }
      return;
    }

    if (event.key === "Enter") {
      if (field === "train") {
        const selectedSuggestion = suggestions[trainActiveIndex] ?? suggestions[0];
        if (selectedSuggestion) {
          event.preventDefault();
          selectTrainSuggestion(selectedSuggestion);
          return;
        }

        const exactMatch = trains.find((train) => train.number.toUpperCase() === trainNumber.trim().toUpperCase());
        if (exactMatch) {
          event.preventDefault();
          setTrainNumber(exactMatch.number);
          setActiveField(null);
          onSelectTrain(exactMatch);
          return;
        }

        event.preventDefault();
        handleTrainSearch();
        return;
      }

      if ((field === "from" || field === "to") && suggestions.length > 0) {
        event.preventDefault();
        const selectedSuggestion = field === "from" ? suggestions[fromActiveIndex] ?? suggestions[0] : suggestions[toActiveIndex] ?? suggestions[0];
        if (selectedSuggestion) {
          selectStationSuggestion(field, selectedSuggestion);
          return;
        }
      }

      if (field !== "train") {
        handleRouteSearch();
      }
    }

    if (event.key === "Escape") {
      setActiveField(null);
    }
  };

  const renderStationDropdown = (field: "from" | "to" | "train") => {
    const suggestions = field === "from" ? fromSuggestions : field === "to" ? toSuggestions : [];
    const activeIndex = field === "from" ? fromActiveIndex : field === "to" ? toActiveIndex : 0;

    if (activeField !== field || suggestions.length === 0) {
      return null;
    }

    return (
      <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-hidden rounded-2xl border border-foreground/10 bg-slate-950/90 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="max-h-72 overflow-y-auto p-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.key}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                selectStationSuggestion(field, suggestion);
              }}
              className={`flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                index === activeIndex ? "bg-primary/15 text-foreground" : "text-foreground/80 hover:bg-white/5"
              }`}
            >
              <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary-soft">
                <TrainFront size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{suggestion.label}</span>
                <span className="block truncate text-xs text-foreground/55">{suggestion.helper}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTrainDropdown = () => {
    if (activeField !== "train" || trainSuggestions.length === 0) {
      return null;
    }

    return (
      <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-hidden rounded-2xl border border-foreground/10 bg-slate-950/90 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="max-h-72 overflow-y-auto p-1">
          {trainSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.key}
              type="button"
              onMouseDown={(event) => {
                event.preventDefault();
                selectTrainSuggestion(suggestion);
              }}
              className={`flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left text-sm transition ${
                index === trainActiveIndex ? "bg-primary/15 text-foreground" : "text-foreground/80 hover:bg-white/5"
              }`}
            >
              <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300">
                <TrainFront size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{suggestion.label}</span>
                <span className="block truncate text-xs text-foreground/55">{suggestion.helper}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section ref={rootRef} className="glass rounded-2xl p-6 md:p-8">
      <div className="mb-7 space-y-3">
        <h2 className="font-display text-2xl font-bold tracking-tight">Search trains your way</h2>
        <p className="text-sm text-foreground/70">Choose route-based search or jump directly to a train.</p>

        <div className="inline-grid w-full max-w-xl grid-cols-2 gap-2 rounded-full border border-foreground/15 bg-foreground/5 p-1">
          <button
            type="button"
            onClick={() => {
              setSearchMode("route");
              setActiveField(null);
            }}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              searchMode === "route"
                ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Search by Route
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchMode("train");
              setActiveField(null);
            }}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
              searchMode === "train"
                ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg shadow-primary/25"
                : "text-foreground/70 hover:text-foreground"
            }`}
          >
            Search by Train Number
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {searchMode === "route" ? (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_220px] lg:items-end">
              <div className="relative">
                <label className="mb-2 block text-xs font-semibold uppercase text-foreground/60">From Station</label>
                <input
                  type="text"
                  value={from}
                  onChange={(event) => {
                    setFrom(event.target.value);
                    setActiveField("from");
                  }}
                  onFocus={() => setActiveField("from")}
                  onKeyDown={(event) => handleFieldKeyDown("from", event)}
                  placeholder="e.g., Delhi, NDLS"
                  autoComplete="off"
                  className="w-full rounded-xl border border-foreground/15 bg-foreground/5 px-4 py-3 text-sm outline-none transition hover:border-foreground/25 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                {renderStationDropdown("from")}
              </div>

              <div className="flex justify-center lg:pb-2">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="group relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/35 bg-gradient-to-br from-primary/25 to-cyan-500/15 text-primary-soft transition duration-300 hover:shadow-[0_0_25px_rgba(88,126,255,0.45)]"
                  aria-label="Swap from and to stations"
                  title="Swap stations"
                >
                  <span className="absolute inset-0 rounded-full border border-white/10" />
                  <ArrowRightLeft size={18} className="transition duration-300 group-hover:rotate-12" />
                </button>
              </div>

              <div className="relative">
                <label className="mb-2 block text-xs font-semibold uppercase text-foreground/60">To Station</label>
                <input
                  type="text"
                  value={to}
                  onChange={(event) => {
                    setTo(event.target.value);
                    setActiveField("to");
                  }}
                  onFocus={() => setActiveField("to")}
                  onKeyDown={(event) => handleFieldKeyDown("to", event)}
                  placeholder="e.g., Mumbai, BCT"
                  autoComplete="off"
                  className="w-full rounded-xl border border-foreground/15 bg-foreground/5 px-4 py-3 text-sm outline-none transition hover:border-foreground/25 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                {renderStationDropdown("to")}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase text-foreground/60">Travel Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-foreground/15 bg-foreground/5 px-4 py-3 text-sm outline-none transition hover:border-foreground/25 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={handleRouteSearch}
                disabled={!from.trim() || !to.trim() || loading}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:-translate-y-0.5"
              >
                <Search size={18} />
                {loading ? "Searching..." : "Search Trains"}
              </button>
              {from || to || date ? (
                <button
                  type="button"
                  onClick={() => {
                    setFrom("");
                    setTo("");
                    setDate("");
                    setFromSuggestions([]);
                    setToSuggestions([]);
                    setActiveField(null);
                  }}
                  className="rounded-xl border border-foreground/15 px-4 py-3 text-sm font-semibold transition hover:border-foreground/30"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="relative">
                <label className="mb-2 block text-xs font-semibold uppercase text-foreground/60">Train Number or Name</label>
                <input
                  type="text"
                  value={trainNumber}
                  onChange={(event) => {
                    setTrainNumber(event.target.value);
                    setActiveField("train");
                  }}
                  onFocus={() => setActiveField("train")}
                  onKeyDown={(event) => handleFieldKeyDown("train", event)}
                  placeholder="Enter train number or train name"
                  autoComplete="off"
                  className="w-full rounded-xl border border-foreground/15 bg-foreground/5 px-4 py-3 text-sm outline-none transition hover:border-foreground/25 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
                {renderTrainDropdown()}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleTrainSearch}
                  disabled={!trainNumber.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:shadow-lg hover:shadow-primary/25 disabled:cursor-not-allowed disabled:opacity-50 hover:enabled:-translate-y-0.5"
                >
                  <Search size={18} />
                  Open Train
                </button>

                {trainNumber ? (
                  <button
                    type="button"
                    onClick={() => {
                      setTrainNumber("");
                      setTrainSuggestions([]);
                      setActiveField(null);
                    }}
                    className="rounded-xl border border-foreground/15 px-4 py-3 text-sm font-semibold transition hover:border-foreground/30"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            <p className="text-xs text-foreground/60">
              Select a suggestion or press Enter to open full train details instantly.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
