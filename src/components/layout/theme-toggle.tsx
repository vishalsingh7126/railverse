"use client";

import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl"
      aria-label="Toggle theme"
    >
      {isDark ? <SunMedium size={18} /> : <Moon size={18} />}
    </button>
  );
}
