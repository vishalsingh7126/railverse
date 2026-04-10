import { AppShell } from "@/components/layout/app-shell";
import { ComingSoon } from "@/components/common/coming-soon";

export default function LiveStatusPage() {
  return (
    <AppShell
      title="Live Status"
      subtitle="Coming Soon"
    >
      <ComingSoon />
    </AppShell>
  );
}
