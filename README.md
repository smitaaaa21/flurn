# Flurn AI Math Evaluator

A minimal full-stack AI math evaluation app built with Next.js App Router, Supabase Auth/DB, and Tailwind CSS.

## Features

- Landing page with Get Started flow
- Google OAuth and email/password authentication
- AI-inspired semantic answer scoring
- Dashboard with streaks, coins, leaderboard, and profile controls
- Admin-editable `questions` table and audit-ready attempt storage

## Setup

1. Copy `.env.example` to `.env.local` and configure:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Initialize Supabase schema by running the SQL in `supabase/schema.sql`.

## Notes

- The assessment backend uses a lightweight NLP-style scorer in `lib/analysis.ts`.
- Profile and attempt persistence use Supabase tables defined in `supabase/schema.sql`.
- Theme toggle is built with `next-themes` and profile actions are available from the dashboard.
