import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase-server';

export async function POST() {
  const supabase = createServerSupabase();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No user' }, { status: 401 });
  }

  // check if profile exists
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single();

if (!existing) {
  await (supabase as any).from('profiles').insert({
    id: user.id,
    full_name: user.user_metadata?.name || '',
  });
}

  return NextResponse.json({ success: true });
}