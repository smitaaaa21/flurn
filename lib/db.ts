export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          age: number | null;
          school: string | null;
          location: string | null;
          coins: number;
          streak: number;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          age?: number | null;
          school?: string | null;
          location?: string | null;
          coins?: number;
          streak?: number;
        };
        Update: {
          full_name?: string | null;
          age?: number | null;
          school?: string | null;
          location?: string | null;
          coins?: number;
          streak?: number;
        };
      };
      questions: {
        Row: {
          id: number;
          prompt: string;
          correct_answer: string;
          metadata: Json | null;
        };
        Insert: {
          id?: number;
          prompt: string;
          correct_answer: string;
          metadata?: Json | null;
        };
        Update: {
          prompt?: string;
          correct_answer?: string;
          metadata?: Json | null;
        };
      };
      attempts: {
        Row: {
          id: number;
          created_at: string | null;
          user_id: string;
          question_id: number;
          answer: string;
          score: number;
          match_score: number;
          details: Json | null;
        };
        Insert: {
          user_id: string;
          question_id: number;
          answer: string;
          score: number;
          match_score: number;
          details?: Json | null;
        };
        Update: {
          answer?: string;
          score?: number;
          match_score?: number;
          details?: Json | null;
        };
      };
    };
  };
};
