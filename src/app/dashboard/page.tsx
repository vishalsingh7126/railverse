import { AppShell } from "@/components/layout/app-shell";
import { ComingSoon } from "@/components/common/coming-soon";

export default function DashboardPage() {
  return (
    <AppShell
      title="Railverse Command Center"
      subtitle="Unified command for bookings, operations, analytics, and traveler safety"
    >
      <ComingSoon />
    </AppShell>
  );
}
