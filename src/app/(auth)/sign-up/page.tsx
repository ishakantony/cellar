"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, GitBranch, Loader2 } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signUp.email({ name, email, password });
    setLoading(false);
    if (result.error) {
      setError(result.error.message ?? "Sign up failed");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleGitHub() {
    await signIn.social({ provider: "github", callbackURL: "/dashboard" });
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
        <p className="text-xs text-outline">Create your vault</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-error/30 bg-error/10 px-4 py-2 text-xs text-error">
            {error}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border-none bg-surface-container px-4 py-2.5 text-sm text-on-surface placeholder:text-outline/50 focus:ring-1 focus:ring-primary/50"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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
          Create Account
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
        <GitBranch className="h-4 w-4" />
        Continue with GitHub
      </button>

      <p className="mt-6 text-center text-xs text-outline">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-primary hover:text-primary-dim transition-colors"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
