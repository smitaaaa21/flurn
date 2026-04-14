'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import AuthForm from '@/components/AuthForm';

export default function AuthPage() {
  return <AuthForm />;
}