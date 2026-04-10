import { cn } from "@/lib/utils";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  return <section className={cn("glass rounded-2xl p-4 md:p-5", className)}>{children}</section>;
}
