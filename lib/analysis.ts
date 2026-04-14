// Normalize text
function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/[.,!?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function evaluateExpression(expression: string) {
  const cleaned = expression.replace(/\s+/g, '');
  if (!/^[0-9+\-*/^().]+$/.test(cleaned)) {
    throw new Error('Invalid expression');
  }

  const safeExpr = cleaned.replace(/\^/g, '**');
  // eslint-disable-next-line no-new-func
  const result = new Function(`return ${safeExpr}`)();

  if (typeof result !== 'number' || Number.isNaN(result)) {
    throw new Error('Unable to evaluate expression');
  }

  return result;
}

function extractMathSegment(prompt: string) {
  let text = prompt.trim();

  text = text.replace(/explain.*$/i, '');
  text = text.replace(/steps.*$/i, '');
  text = text.replace(/answer.*$/i, '');
  text = text.replace(/^please\s+/i, '');
  text = text.replace(/\?$/, '');

  const solveForMatch = text.match(/solve\s+for\s+[a-z]\s*:\s*(.+)$/i);
  if (solveForMatch?.[1]) return solveForMatch[1].trim();

  const findIfMatch = text.match(/find\s+[a-z]\s+(?:if|when|given)\s+(.+)$/i);
  if (findIfMatch?.[1]) return findIfMatch[1].trim();

  const whatIsMatch = text.match(/what\s+is\s+(.+)$/i);
  if (whatIsMatch?.[1]) return whatIsMatch[1].trim();

  const calculateMatch = text.match(/calculate\s+(.+)$/i);
  if (calculateMatch?.[1]) return calculateMatch[1].trim();

  const equationMatch = text.match(/([0-9()+\-*/^\.\s]+=[0-9()+\-*/^\.\s]+)/);
  if (equationMatch?.[1]) return equationMatch[1].trim();

  const explicitValueMatch = text.match(/=[\s]*([+-]?\d*\.?\d+)$/);
  if (explicitValueMatch?.[1]) return explicitValueMatch[1].trim();

  return text;
}

function solveLinearEquation(prompt: string) {
  const cleaned = prompt.replace(/\s+/g, '');
  const linearMatch = cleaned.match(/^([+-]?\d*)([a-z])([+-]?\d*)=([+-]?\d+)$/i);
  if (!linearMatch) return null;

  let [, coef, variable, constant, result] = linearMatch;
  if (!coef || coef === '+') coef = '1';
  if (coef === '-') coef = '-1';

  const a = Number(coef);
  const b = Number(constant || '0');
  const c = Number(result);

  if (Number.isNaN(a) || Number.isNaN(b) || Number.isNaN(c) || a === 0) return null;
  return (c - b) / a;
}

export function parseCorrectAnswer(prompt: string) {
  const trimmed = extractMathSegment(prompt);
  const equalsIndex = trimmed.indexOf('=');

  if (equalsIndex !== -1) {
    const left = trimmed.slice(0, equalsIndex).trim();
    const right = trimmed.slice(equalsIndex + 1).trim();

    if (right === '' || /\?$/.test(right)) {
      try {
        return String(evaluateExpression(left));
      } catch {
        return null;
      }
    }

    const linear = solveLinearEquation(trimmed);
    if (linear !== null) {
      return String(linear);
    }

    const leftValue = /^[0-9()+\-*/^\.\s]+$/.test(left);
    const rightValue = /^[0-9()+\-*/^\.\s]+$/.test(right);
    if (leftValue && rightValue) {
      try {
        const leftEval = evaluateExpression(left);
        const rightEval = evaluateExpression(right);
        if (!Number.isNaN(leftEval) && !Number.isNaN(rightEval)) {
          return String(leftEval === rightEval ? leftEval : rightEval);
        }
      } catch {
        return null;
      }
    }
  }

  const mathMatch = trimmed.match(/([0-9()+\-*/^\.]+)\s*$/);
  if (mathMatch && mathMatch[1]) {
    try {
      return String(evaluateExpression(mathMatch[1]));
    } catch {
      return null;
    }
  }

  return null;
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