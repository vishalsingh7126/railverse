import { Bell, Search, Wifi } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Chip } from "@/components/ui/chip";

type TopbarProps = {
  title: string;
  subtitle: string;
};

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="glass sticky top-4 z-30 mb-4 rounded-2xl p-3 md:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold tracking-tight md:text-2xl">{title}</h1>
          <p className="text-sm text-foreground/70">{subtitle}</p>
        </div>
        <div className="flex w-full items-center justify-end gap-2 md:w-auto">
          <div className="glass hidden items-center gap-2 rounded-xl px-3 py-2 md:flex">
            <Search size={16} className="text-foreground/65" />
            <input
              className="w-44 bg-transparent text-sm outline-none placeholder:text-foreground/45"
              placeholder="Search train, PNR, station"
            />
          </div>
          <Chip tone="success" className="hidden md:inline-flex">
            <Wifi size={12} className="mr-1" />
            Live Sync
          </Chip>
          <button className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl">
            <Bell size={18} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
