"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type AuthTab = "login" | "signup";

type AuthModalProps = {
  isOpen: boolean;
  initialTab?: AuthTab;
  onClose: () => void;
  onAuthSuccess: (payload: { name?: string }) => void;
};

export function AuthModal({ isOpen, initialTab = "login", onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  const handleLoginSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!loginEmail || !loginPassword) {
      return;
    }

    onAuthSuccess({});
  };

  const handleSignupSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signupName || !signupEmail || !signupPassword) {
      return;
    }

    onAuthSuccess({ name: signupName });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close authentication modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
      />

      <div className="glass relative z-10 w-full max-w-md rounded-3xl border border-foreground/10 bg-[linear-gradient(160deg,rgba(14,24,41,0.92)_0%,rgba(9,17,33,0.82)_100%)] p-5 text-foreground shadow-[0_20px_70px_rgba(0,0,0,0.45)] transition duration-300 ease-out md:p-6">
        <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />

        <div className="relative mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Welcome aboard</h2>
            <p className="mt-1 text-sm text-foreground/70">Access your smart railway workspace</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="glass inline-flex h-9 w-9 items-center justify-center rounded-xl border border-foreground/10 text-foreground/80 transition hover:text-foreground"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative mb-5 grid grid-cols-2 gap-2 rounded-xl border border-foreground/10 bg-foreground/5 p-1">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              activeTab === "login" ? "bg-primary/90 text-white" : "text-foreground/70 hover:text-foreground",
            )}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("signup")}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium transition",
              activeTab === "signup" ? "bg-primary/90 text-white" : "text-foreground/70 hover:text-foreground",
            )}
          >
            Sign Up
          </button>
        </div>

        {activeTab === "login" ? (
          <form onSubmit={handleLoginSubmit} className="relative space-y-3">
            <label className="block text-sm text-foreground/80">
              Email
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-foreground/10 bg-black/20 px-3 py-2.5 text-sm outline-none ring-0 transition placeholder:text-foreground/45 focus:border-primary/60"
                placeholder="you@railverse.com"
              />
            </label>
            <label className="block text-sm text-foreground/80">
              Password
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-foreground/10 bg-black/20 px-3 py-2.5 text-sm outline-none ring-0 transition placeholder:text-foreground/45 focus:border-primary/60"
                placeholder="••••••••"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} className="relative space-y-3">
            <label className="block text-sm text-foreground/80">
              Name
              <input
                type="text"
                required
                value={signupName}
                onChange={(event) => setSignupName(event.target.value)}
                className="mt-1 w-full rounded-xl border border-foreground/10 bg-black/20 px-3 py-2.5 text-sm outline-none ring-0 transition placeholder:text-foreground/45 focus:border-primary/60"
                placeholder="Ava Sharma"
              />
            </label>
            <label className="block text-sm text-foreground/80">
              Email
              <input
                type="email"
                required
                value={signupEmail}
                onChange={(event) => setSignupEmail(event.target.value)}
                className="mt-1 w-full rounded-xl border border-foreground/10 bg-black/20 px-3 py-2.5 text-sm outline-none ring-0 transition placeholder:text-foreground/45 focus:border-primary/60"
                placeholder="you@railverse.com"
              />
            </label>
            <label className="block text-sm text-foreground/80">
              Password
              <input
                type="password"
                required
                value={signupPassword}
                onChange={(event) => setSignupPassword(event.target.value)}
                className="mt-1 w-full rounded-xl border border-foreground/10 bg-black/20 px-3 py-2.5 text-sm outline-none ring-0 transition placeholder:text-foreground/45 focus:border-primary/60"
                placeholder="Create a secure password"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
            >
              Create Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
}