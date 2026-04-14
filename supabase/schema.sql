-- Supabase schema for Flurn AI Math Evaluator

create table if not exists profiles (
  id uuid primary key,
  created_at timestamp with time zone default now(),
  email text,
  full_name text,
  age int,
  school text,
  location text,
  coins int default 0,
  streak int default 0
);

create table if not exists questions (
  id serial primary key,
  prompt text not null,
  correct_answer text not null,
  metadata jsonb
);

create table if not exists attempts (
  id serial primary key,
  created_at timestamp with time zone default now(),
  user_id uuid references profiles(id) on delete cascade,
  question_id int references questions(id),
  answer text not null,
  score int not null,
  match_score int not null,
  details jsonb
);

insert into questions (prompt, correct_answer, metadata)
values
  ('Solve for x: 4x + 7 = 31. Explain your steps clearly.', 'x = 6', '{"topic": "linear equations", "difficulty": "easy"}')
on conflict do nothing;
