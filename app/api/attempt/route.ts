import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { analyzeAnswer } from '@/lib/analysis';

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  const body = await request.json();
  const { questionId, answer } = body;

  const questionRes = await supabase
    .from('questions')
    .select('id, prompt, correct_answer')
    .eq('id', questionId)
    .limit(1)
    .single();

  const question = questionRes.data || {
    id: 1,
    prompt: 'Solve for x: 4x + 7 = 31. Explain your steps clearly.',
    correct_answer: 'x = 6'
  };

  const analysis = analyzeAnswer(answer, question.correct_answer);
  const coinsEarned = Math.max(3, Math.round(analysis.matchScore / 10));

  await supabase.from('attempts').insert({
    user_id: user.id,
    question_id: question.id,
    answer,
    score: analysis.score,
    match_score: analysis.matchScore,
    details: {
      issues: analysis.issues,
      missingKeywords: analysis.missingKeywords
    }
  });

  const profileRes = await supabase.from('profiles').select('coins, streak').eq('id', user.id).single();
  const existing = profileRes.data;
  const nextStreak = analysis.matchScore >= 80 ? (existing?.streak ?? 0) + 1 : 0;
  const nextCoins = (existing?.coins ?? 0) + coinsEarned;

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      coins: nextCoins,
      streak: nextStreak
    },
    { onConflict: 'id' }
  );

  return NextResponse.json({
    ...analysis,
    coinsEarned
  });
}