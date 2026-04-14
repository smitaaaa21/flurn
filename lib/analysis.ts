// Normalize text
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ✅ Math-aware tokenization
function mathTokens(text: string) {
  return normalize(text)
    .replace(/([=+\-*/^()])/g, ' $1 ')
    .split(' ')
    .filter(Boolean);
}

// ✅ Synonym mapping
const synonyms: Record<string, string[]> = {
  force: ['f'],
  mass: ['m'],
  acceleration: ['a'],
  velocity: ['v'],
  distance: ['d'],
};

// Normalize tokens using synonyms
function normalizeTokens(tokens: string[]) {
  return tokens.map((token) => {
    for (const key in synonyms) {
      if (synonyms[key]?.includes(token)) return key;
    }
    return token;
  });
}

// Overlap score
function overlapScore(source: string[], target: string[]) {
  const set = new Set(target);
  const common = source.filter((token) => set.has(token));
  return source.length === 0 ? 0 : (common.length / source.length) * 100;
}

// ✅ Edit distance with quick fix (!)
function editDistance(a: string, b: string) {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) dp[i]![0] = i;
  for (let j = 0; j <= b.length; j++) dp[0]![j] = j;

  for (let i = 1; i <= a.length; i++) {
    const row = dp[i]!;
    const prev = dp[i - 1]!;

    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      row[j] = Math.min(
        prev[j]! + 1,
        row[j - 1]! + 1,
        prev[j - 1]! + cost
      );
    }
  }

  return dp[a.length]![b.length]!;
}

// Extract final numeric value
function extractFinalValue(text: string) {
  const match = text.match(/[-+]?\d*\.?\d+/g);
  return match ? match[match.length - 1] : null;
}

// ✅ MAIN ANALYZER
export function analyzeAnswer(answer: string, correct: string) {
  const normalizedAnswer = normalize(answer);
  const normalizedCorrect = normalize(correct);

  let answerTokens = mathTokens(normalizedAnswer);
  let correctTokens = mathTokens(normalizedCorrect);

  answerTokens = normalizeTokens(answerTokens);
  correctTokens = normalizeTokens(correctTokens);

  const keywordMatch = overlapScore(correctTokens, answerTokens);
  const reverseMatch = overlapScore(answerTokens, correctTokens);
  const semanticScore = Math.round((keywordMatch + reverseMatch) / 2);

  const distance = editDistance(normalizedAnswer, normalizedCorrect);

  const lengthPenalty = Math.min(
    15,
    (distance / Math.max(normalizedCorrect.length, 1)) * 100
  );

  let finalScore = Math.max(
    0,
    Math.round(semanticScore - lengthPenalty * 0.2)
  );

  // ✅ Exact match boost
  if (normalizedAnswer === normalizedCorrect) {
    finalScore = 100;
  }

  // ✅ Final value correctness check
  const userFinal = extractFinalValue(normalizedAnswer);
  const correctFinal = extractFinalValue(normalizedCorrect);

  if (userFinal && correctFinal && userFinal !== correctFinal) {
    finalScore = Math.min(finalScore, 40);
  }

  // Missing keywords
  const missingKeywords = correctTokens.filter(
    (token) => !answerTokens.includes(token)
  );

  // Feedback
  const issues: string[] = [];

  if (finalScore < 70) {
    issues.push('Answer lacks complete reasoning or correct steps.');
  }

  if (missingKeywords.length > 0) {
    issues.push(
      `Missing key terms: ${missingKeywords.slice(0, 5).join(', ')}`
    );
  }

  if (userFinal && correctFinal && userFinal !== correctFinal) {
    issues.push(`Final answer is incorrect. Expected ${correctFinal}`);
  }

  const correction =
    normalizedAnswer === normalizedCorrect
      ? 'Perfect answer.'
      : `Expected: ${correct}`;

  return {
    score: finalScore,
    matchScore: finalScore,
    correction,
    missingKeywords: Array.from(new Set(missingKeywords)).slice(0, 5),
    issues,
  };
}