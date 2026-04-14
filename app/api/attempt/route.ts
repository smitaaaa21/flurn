import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { analyzeAnswer, parseCorrectAnswer } from '@/lib/analysis';

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
  const { questionPrompt, answer } = body;

  if (!questionPrompt || !answer) {
    return NextResponse.json({ error: 'Question prompt and answer are required.' }, { status: 400 });
  }

  const parsedCorrectAnswer = parseCorrectAnswer(questionPrompt);
  if (!parsedCorrectAnswer) {
    return NextResponse.json(
      { error: 'Unable to verify correctness from this prompt. Use a simple arithmetic or linear expression.' },
      { status: 400 }
    );
  }

  const prompt = questionPrompt.trim();
  let questionId = body.questionId;
  let question = null as null | { prompt: string; correct_answer?: string };

  if (!questionId) {
    let insertRes = await supabase
      .from('questions')
      .insert({ prompt, correct_answer: parsedCorrectAnswer })
      .select('id')
      .single();

    if (insertRes.error && insertRes.error.message.includes("'correct_answer'")) {
      insertRes = await supabase
        .from('questions')
        .insert({ prompt })
        .select('id')
        .single();
    }

    if (insertRes.error || !insertRes.data) {
      return NextResponse.json(
        { error: `Unable to save the question. ${insertRes.error?.message ?? 'Unknown error.'}` },
        { status: 500 }
      );
    }

    questionId = insertRes.data.id;
  } else {
    const questionRes = await supabase
      .from('questions')
      .select('prompt')
      .eq('id', questionId)
      .limit(1)
      .single();

    if (questionRes.error || !questionRes.data) {
      return NextResponse.json(
        { error: `Unable to load stored question. ${questionRes.error?.message ?? 'Unknown error.'}` },
        { status: 500 }
      );
    }

    question = questionRes.data;
  }

  const finalPrompt = question?.prompt || prompt;
  const finalAnswer = question?.correct_answer || parsedCorrectAnswer;
  const analysis = analyzeAnswer(answer, finalAnswer);
  const coinsEarned = Math.max(3, Math.round(analysis.matchScore / 10));

  const insertAttempt = await supabase.from('attempts').insert({
    user_id: user.id,
    question_id: questionId,
    answer,
    score: analysis.score,
    match_score: analysis.matchScore,
    details: {
      issues: analysis.issues,
      missingKeywords: analysis.missingKeywords,
      correctAnswer: finalAnswer,
      prompt: finalPrompt,
    },
  });

  if (insertAttempt.error) {
    return NextResponse.json({ error: 'Unable to save attempt: ' + insertAttempt.error.message }, { status: 500 });
  }

  const profileRes = await supabase.from('profiles').select('coins, streak').eq('id', user.id).single();
  const existing = profileRes.data;
  const nextStreak = analysis.matchScore >= 80 ? (existing?.streak ?? 0) + 1 : 0;
  const nextCoins = (existing?.coins ?? 0) + coinsEarned;

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      coins: nextCoins,
      streak: nextStreak,
    },
    { onConflict: 'id' }
  );

  const normalizeString = (value: string) =>
    value
      .toLowerCase()
      .replace(/[.,!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  return NextResponse.json({
    ...analysis,
    coinsEarned,
    correctAnswer: finalAnswer,
    prompt: finalPrompt,
    isCorrect: normalizeString(answer) === normalizeString(finalAnswer),
    flow: [
      'Receive the question prompt.',
      `Interpret the problem: ${finalPrompt}`,
      'Compute the correct answer from the prompt.',
      `Match the submitted answer against: ${finalAnswer}`,
      'Generate the detailed report.',
    ],
  });
}
