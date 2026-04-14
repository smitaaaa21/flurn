'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useSupabase } from '@/components/supabase-provider';

export function ProfileMenu() {
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener?.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return (
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:border-brand-500/40"
        disabled
      >
        <User className="h-4 w-4" />
        Loading...
      </button>
    );
  }
  const router = useRouter();

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push('/auth');
    router.refresh();
  };

  return (
    <div className="relative inline-flex text-left">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-100 hover:border-brand-500/40"
      >
        <User className="h-4 w-4" />
        {session?.user.email ?? 'Account'}
        <ChevronDown className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-white/10 bg-[#07120e] p-4 shadow-soft">
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Signed in as</p>
            <p className="truncate text-sm font-semibold text-white">{session?.user.email}</p>
            <Link href="/dashboard" className="block rounded-2xl bg-white/5 px-4 py-2 text-sm text-slate-100 hover:bg-white/10">
              Dashboard
            </Link>
            <button onClick={signOut} className="flex w-full items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-400">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
