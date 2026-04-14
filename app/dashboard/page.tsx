import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ProfileMenu } from '@/components/profile-menu';
import { ThemeToggle } from '@/components/theme-toggle';

type Profile = {
  full_name?: string | null;
  school?: string | null;
  location?: string | null;
  age?: number | null;
  coins?: number;
  streak?: number;
};

export default async function DashboardPage() {
  const supabase = createServerSupabase();

  // ✅ SINGLE AUTH CALL
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth');

  // ✅ PARALLEL FETCH (IMPORTANT FIX)
  const [profileRes, leaderboardRes, attemptsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle(),

    supabase
      .from('profiles')
      .select('id, full_name, coins, streak')
      .order('coins', { ascending: false })
      .limit(5),

    supabase
      .from('attempts')
      .select('id, question_id, score, match_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(6)
  ]);

  const profile = profileRes.data as Profile | null;
  const topProfiles = leaderboardRes.data ?? [];
  const attempts = attemptsRes.data ?? [];

  const rank =
    topProfiles.findIndex((item: any) => item.id === user.id) + 1 ||
    topProfiles.length + 1;

  return (
    <main className="min-h-screen py-20 px-6">
      <div className="container space-y-10">

        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-brand-200">Welcome back</p>
            <h1 className="text-4xl text-white">Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent>🔥 {profile?.streak ?? 0} Streak</CardContent></Card>
          <Card><CardContent>🪙 {profile?.coins ?? 0} Coins</CardContent></Card>
          <Card><CardContent>🏆 Rank #{rank}</CardContent></Card>
        </div>

        {/* PROFILE */}
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            <p>{profile?.full_name || user.email}</p>
            <p>{profile?.school || 'School not set'}</p>
            <p>{profile?.location || 'Location not set'}</p>
            <p>Age {profile?.age ?? '—'}</p>
          </CardContent>
        </Card>

        {/* LEADERBOARD */}
        <Card>
          <CardHeader><CardTitle>Leaderboard</CardTitle></CardHeader>
          <CardContent>
            {topProfiles.map((p: any, i: number) => (
              <div key={p.id}>
                #{i + 1} {p.full_name} ({p.coins})
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ATTEMPTS */}
        <Card>
          <CardHeader><CardTitle>Attempts</CardTitle></CardHeader>
          <CardContent>
            {attempts.length ? (
              attempts.map((a: any) => (
                <div key={a.id}>
                  Q{a.question_id} → {a.match_score}%
                </div>
              ))
            ) : (
              <p>No attempts yet</p>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Link href="/attempt" className="bg-green-600 px-4 py-2 text-white">
          Start Practice
        </Link>

      </div>
    </main>
  );
}