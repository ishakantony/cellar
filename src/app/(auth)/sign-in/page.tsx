"use client";

import { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, GitBranch, Loader2 } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn.email({ email, password });
      if (result.error) {
        setError(result.error.message ?? "Sign in failed");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleGitHub() {
    try {
      await signIn.social({ provider: "github", callbackURL: "/dashboard" });
    } catch {
      setError("GitHub sign in failed");
    }
  }

  return (
    <>
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
          <Package className="h-5 w-5" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-100">
          Cellar
        </h1>
        <p className="text-xs text-outline">Sign in to your vault</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-xs text-error">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container/30 border border-primary/30 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary-container/50 hover:border-primary/50 transition-all disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign In
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-outline-variant/30" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
          or
        </span>
        <div className="h-px flex-1 bg-outline-variant/30" />
      </div>

      <button
        onClick={handleGitHub}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-container ghost-border px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-bright hover:text-slate-100 transition-all"
      >
        {/* Github icon removed in lucide-react 1.8.0; GitBranch used as substitute */}
        <GitBranch className="h-4 w-4" />
        Continue with GitHub
      </button>

      <p className="mt-6 text-center text-xs text-outline">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-primary hover:text-primary-dim transition-colors"
        >
          Sign up
        </Link>
      </p>
    </>
  );
}
