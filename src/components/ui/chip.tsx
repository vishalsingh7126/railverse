import { cn } from "@/lib/utils";

type ChipProps = {
  children: React.ReactNode;
  tone?: "default" | "success" | "warn" | "danger";
  className?: string;
};

const toneMap = {
  default: "bg-blue-500/10 text-blue-600 dark:text-blue-200 border-blue-500/20",
  success:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 border-emerald-500/20",
  warn: "bg-amber-500/10 text-amber-600 dark:text-amber-200 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-600 dark:text-rose-200 border-rose-500/20",
};

export function Chip({ children, tone = "default", className }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        toneMap[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
