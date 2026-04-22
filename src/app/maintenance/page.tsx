"use client";

import Image from "next/image";

export default function MaintenancePage() {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#020617] via-[#0f172a] to-[#020617] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:22px_22px]" />
      <div className="pointer-events-none absolute left-1/2 top-24 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute left-0 top-0 h-[22rem] w-[22rem] rounded-full bg-cyan-400/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 py-14 sm:px-6 lg:px-8">
        <section
          className="relative w-full max-w-5xl rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_0_80px_rgba(59,130,246,0.15)] backdrop-blur-xl transition-transform duration-500 sm:p-10 lg:p-12"
          style={{ animation: "rvFloat 8s ease-in-out infinite" }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_35%,transparent_70%,rgba(255,255,255,0.04)_100%)]" />

          <div className="relative">
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                  <div className="pointer-events-none absolute inset-0 rounded-2xl bg-blue-400/25 blur-md" />
                  <Image src="/logo-icon.png" alt="Railverse" width={30} height={30} priority className="relative" />
                </div>

                <div>
                  <p className="font-display text-xl font-bold tracking-[0.2em] text-white uppercase">Railverse</p>
                  <p className="text-xs uppercase tracking-[0.32em] text-slate-300/80">TravelCore Platform</p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-200">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.95)] animate-pulse" />
                Live Update
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400">
                🚧 Under Maintenance
              </div>

              <div className="space-y-4">
                <h1 className="font-display text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300 sm:text-5xl">
                  Railverse
                </h1>
                <p className="text-lg text-slate-300 sm:text-xl">We&apos;re upgrading your experience.</p>
                <p className="max-w-3xl text-sm leading-7 text-slate-300/80 sm:text-base">
                  Railverse is undergoing scheduled maintenance. We&apos;ll be back shortly with a faster, smoother experience.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:scale-105 hover:shadow-[0_14px_36px_rgba(255,255,255,0.2)] sm:w-auto"
                >
                  Refresh
                </button>
                <a
                  href="mailto:travelcore.auth@gmail.com?subject=Railverse%20Support%20Request"
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-xl border border-white/20 bg-transparent px-5 py-3 text-sm font-semibold text-white transition duration-300 hover:scale-105 hover:bg-white/10 sm:w-auto"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes rvFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </main>
  );
}