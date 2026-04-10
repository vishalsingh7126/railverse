import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] gap-4 p-3 md:p-4">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar title={title} subtitle={subtitle} />
        <main className="space-y-4 pb-24 lg:pb-10">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}
