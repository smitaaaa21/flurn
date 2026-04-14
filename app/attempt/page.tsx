'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const question = {
  id: 1,
  prompt: 'Solve for x: 4x + 7 = 31. Explain your steps clearly.',
  correct_answer: 'x = 6'
};

export default function AttemptPage() {
  const [answer, setAnswer] = useState('');
  const [reference, setReference] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch('/api/attempt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId: question.id, answer })
    });

    if (!response.ok) {
      const body = await response.json();
      setError(body.error || 'Unable to evaluate your answer.');
    } else {
      setResult(await response.json());
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-20 text-slate-100">
      <div className="container mx-auto max-w-4xl">
        <div className="rounded-[2rem] border border-slate-700 bg-slate-900/80 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.35)]">
          <form onSubmit={submit} className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Math assessment</p>
              <h1 className="text-3xl font-semibold text-white sm:text-4xl">Answer the math question below</h1>
              <p className="text-sm leading-6 text-slate-400">Provide your solution and reasoning in the large field. Optionally add the reference solution to help the evaluator.</p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950 p-6">
              <label className="mb-3 block text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Question prompt</label>
              <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-slate-200 shadow-inner">
                <p className="text-base leading-7">{question.prompt}</p>
              </div>
            </div>

            <div className="space-y-3 rounded-[1.75rem] border border-slate-700 bg-slate-950 p-6">
              <label className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Your answer</label>
              <textarea
                rows={8}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="e.g., Calculate the flux of F(x,y,z) = xi + yj + zk across the sphere x^2 + y^2 + z^2 = 9."
                className="w-full resize-none rounded-3xl border border-slate-700 bg-slate-900 px-5 py-5 text-base text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                required
              />
            </div>

            <div className="space-y-3 rounded-[1.75rem] border border-slate-700 bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Reference solution (optional)</label>
                <span className="text-xs text-slate-500">Helps improve AI evaluation</span>
              </div>
              <textarea
                rows={5}
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Provide the correct steps and answer for better AI evaluation..."
                className="w-full resize-none rounded-3xl border border-slate-700 bg-slate-900 px-5 py-5 text-base text-slate-100 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            {error ? <p className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

            <Button type="submit" className="flex w-full items-center justify-center rounded-3xl bg-brand-500 px-6 py-5 text-base font-semibold text-white transition hover:bg-brand-400" disabled={loading}>
              {loading ? 'Proceeding…' : 'Proceed to Solve'}
            </Button>
          </form>

          {result ? (
            <div className="mt-10 rounded-[1.75rem] border border-slate-700 bg-slate-950 p-6">
              <div className="mb-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Match Score</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{result.matchScore}%</p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Coins Earned</p>
                  <p className="mt-3 text-3xl font-semibold text-brand-300">+{Math.max(3, Math.round(result.matchScore / 10))}</p>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-3xl bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Mistakes</p>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{result.issues.length ? result.issues.join(' ') : 'No major mistakes detected.'}</p>
                </div>
                <div className="rounded-3xl bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Missing Keywords</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.missingKeywords.length ? (
                      result.missingKeywords.map((keyword: string) => (
                        <span key={keyword} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">None</span>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-900 p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Analysis</p>
                  <div className="mt-4 space-y-4">
                    <Progress value={result.matchScore} label="Semantic match" />
                    <Progress value={Math.min(100, result.matchScore + 10)} label="Keyword coverage" />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}
