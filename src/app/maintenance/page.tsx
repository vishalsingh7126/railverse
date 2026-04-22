"use client";

import Image from "next/image";

export default function MaintenancePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.35)_0%,rgba(3,7,18,0.98)_42%,rgba(2,6,23,1)_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.08)_0%,transparent_35%,rgba(59,130,246,0.12)_70%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
        <section className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-10 md:p-12">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12)_0%,transparent_22%,transparent_78%,rgba(255,255,255,0.06)_100%)]" />
          <div className="relative">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 shadow-[0_0_40px_rgba(59,130,246,0.28)]">
                  <Image src="/logo-icon.png" alt="Railverse" width={30} height={30} priority />
                </div>
                <div>
                  <p className="font-display text-xl font-semibold tracking-[0.18em] text-white/95 uppercase">Railverse</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-cyan-200/70">TravelCore Platform</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-100">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.95)] animate-pulse" />
                Live Update
              </div>
            </div>

            <div className="space-y-5">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                🚧 Under Maintenance
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">Railverse</h1>
                <p className="max-w-xl text-lg leading-8 text-white/80 sm:text-xl">
                  We&apos;re upgrading your experience.
                </p>
                <p className="max-w-2xl text-sm leading-7 text-slate-200/70 sm:text-base">
                  Railverse is undergoing scheduled maintenance. We&apos;ll be back shortly with a faster, smoother experience.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-300/10">
                    <div className="h-5 w-5 rounded-full border-2 border-cyan-200/80 border-t-transparent animate-spin" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Estimated time</p>
                    <p className="mt-1 text-sm font-medium text-white/80">Back online shortly</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleRefresh}
                    className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-50"
                  >
                    Refresh
                  </button>
                  <a
                    href="mailto:support@railverse.com"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}