export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  age: number | null;
  school: string | null;
  location: string | null;
  coins: number;
  streak: number;
};

export type AttemptResult = {
  score: number;
  matchScore: number;
  correction: string;
  missingKeywords: string[];
  issues: string[];
};

export type LeaderboardEntry = {
  user_id: string;
  full_name: string | null;
  coins: number;
  streak: number;
  rank: number;
};
