"use client";

import { useState } from "react";
import type { UnifiedTrain } from "@/lib/trainData";
import { searchTrains } from "@/lib/trainData";
import { AppShell } from "@/components/layout/app-shell";
import { TrainSearchForm } from "@/components/train-search/TrainSearchForm";
import { TrainCard } from "@/components/train-search/TrainCard";
import { TrainDetailsModal } from "@/components/train-search/TrainDetailsModal";
import { ActivitySquare } from "lucide-react";

export default function TrainSearchPage() {
  const [searchResults, setSearchResults] = useState<UnifiedTrain[]>([]);
  const [selectedTrain, setSelectedTrain] = useState<UnifiedTrain | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({ from: "", to: "" });

  const handleSearch = (from: string, to: string, date: string) => {
    setLoading(true);
    setHasSearched(true);

    setTimeout(() => {
      const results = searchTrains(from, to);
      setSearchResults(results);
      setSearchParams({ from, to });
      setLoading(false);
    }, 300);
  };

  const handleCloseModal = () => {
    setSelectedTrain(null);
  };

  return (
    <AppShell
      title="Train Search"
      subtitle="Find and book trains with real-time schedule information"
    >
      <div className="space-y-8">
        {/* Search Form */}
        <TrainSearchForm onSearch={handleSearch} onSelectTrain={setSelectedTrain} loading={loading} />

        {/* Results Section */}
        {hasSearched && (
          <section className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  {loading ? "Searching..." : `Search Results`}
                </h2>
                {!loading && (
                  <p className="mt-1 text-sm text-foreground/70">
                    {searchResults.length === 0
                      ? "No trains found for this route"
                      : `Found ${searchResults.length} train${searchResults.length !== 1 ? "s" : ""} from ${searchParams.from} to ${searchParams.to}`}
                  </p>
                )}
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-12 w-12 rounded-full border-4 border-foreground/20 border-t-primary animate-spin" />
                </div>
                <p className="text-foreground/70">Searching for available trains...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && searchResults.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ActivitySquare size={32} className="text-primary-soft" />
                </div>
                <h3 className="font-display text-xl font-bold">No trains found</h3>
                <p className="mt-2 text-sm text-foreground/70 max-w-sm mx-auto">
                  Sorry, there are no direct trains available for the selected route. Try searching with different stations or dates.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setHasSearched(false);
                    setSearchResults([]);
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary/15 border border-primary/40 px-4 py-2 text-sm font-semibold text-primary-soft transition hover:bg-primary/25"
                >
                  New Search
                </button>
              </div>
            )}

            {/* Train Results Grid */}
            {!loading && searchResults.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {searchResults.map((train) => (
                  <TrainCard
                    key={train.number}
                    train={train}
                    onClick={setSelectedTrain}
                  />
                ))}
              </div>
            )}

            {/* Results Footer Info */}
            {!loading && searchResults.length > 0 && (
              <div className="glass rounded-2xl p-4">
                <p className="text-xs text-foreground/60">
                  💡 Click on any train card to view full schedule, coach layout, and more details.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Empty Initial State */}
        {!hasSearched && (
          <section className="text-center py-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/20">
              <ActivitySquare size={48} className="text-primary-soft" />
            </div>
            <h3 className="font-display text-2xl font-bold">Ready to search?</h3>
            <p className="mt-3 text-foreground/70 max-w-sm mx-auto">
              Enter your departure and arrival stations above to find available trains and view detailed schedules.
            </p>
          </section>
        )}
      </div>

      {/* Train Details Modal */}
      <TrainDetailsModal train={selectedTrain} onClose={handleCloseModal} />
    </AppShell>
  );
}
