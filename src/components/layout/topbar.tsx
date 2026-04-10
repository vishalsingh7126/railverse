import { Bell, Search, Wifi } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { Chip } from "@/components/ui/chip";

export type TopbarAuthState = {
  isLoggedIn: boolean;
  userName?: string;
  userInitials?: string;
  onLogoutClick?: () => void;
};

type TopbarProps = {
  title: string;
  subtitle: string;
  authState?: TopbarAuthState;
};

export function Topbar({ title, subtitle, authState }: TopbarProps) {
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

          {authState && authState.isLoggedIn ? (
              <div className="hidden items-center gap-2 md:flex">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-primary/20 text-sm font-semibold text-primary-soft">
                  {authState.userInitials ?? "RV"}
                </div>
                <div className="hidden text-left xl:block">
                  <p className="text-xs text-foreground/70">Signed in as</p>
                  <p className="text-sm font-semibold leading-tight">{authState.userName || "Railverse User"}</p>
                </div>
                <button
                  type="button"
                  onClick={authState.onLogoutClick}
                  className="glass rounded-lg border border-foreground/15 px-3 py-2 text-xs font-semibold text-foreground/80 transition hover:text-foreground"
                >
                  Logout
                </button>
              </div>
          ) : null}

          <button className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl">
            <Bell size={18} />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
