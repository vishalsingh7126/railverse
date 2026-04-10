import { AppShell } from "@/components/layout/app-shell";
import { ComingSoon } from "@/components/common/coming-soon";

export default function BookTicketsPage() {
  return (
    <AppShell
      title="Book Tickets"
      subtitle="Coming Soon"
    >
      <ComingSoon />
    </AppShell>
  );
}
