import Link from 'next/link';
import { ArrowRight, Sparkles, UserCheck } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen py-20 px-6">
      <div className="container">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-center">
          <section className="space-y-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-600/30 bg-brand-900/50 px-4 py-2 text-sm text-brand-100">
              <Sparkles className="h-4 w-4" />
              AI-powered math evaluation with instant analysis
            </span>
            <div className="space-y-6">
              <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                Build confidence with every answer.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300">
                Submit your math solution, receive a semantic similarity score, and track your streaks,
                coins, and leaderboard position with an elegant learning dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/auth"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-400"
              >
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm text-slate-100 transition hover:border-brand-500/40 hover:bg-brand-900/70">
                View Dashboard
              </Link>
            </div>
          </section>

          <section className="space-y-6 rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-soft">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.24em] text-brand-200">Quick preview</p>
              <h2 className="text-3xl font-semibold text-white">Sample assessment</h2>
            </div>
            <div className="space-y-4 rounded-3xl bg-brand-900/80 p-6 text-slate-100">
              <p className="text-sm text-brand-100">Question</p>
              <p className="text-lg font-medium">If 5x - 4 = 16, what is x?</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-[#0f1a14] p-4">
                  <p className="text-xs uppercase text-slate-400">Your match</p>
                  <p className="mt-2 text-3xl font-semibold text-white">92%</p>
                </div>
                <div className="rounded-3xl bg-[#0f1a14] p-4">
                  <p className="text-xs uppercase text-slate-400">Coins earned</p>
                  <p className="mt-2 text-3xl font-semibold text-brand-300">+12</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
