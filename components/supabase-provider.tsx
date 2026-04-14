'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createBrowserSupabaseClient } from '@/lib/supabase-client';

const SupabaseContext = createContext<ReturnType<typeof createBrowserSupabaseClient> | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabaseClient, setSupabaseClient] = useState<ReturnType<typeof createBrowserSupabaseClient>>(null);

  useEffect(() => {
    const client = createBrowserSupabaseClient();
    setSupabaseClient(client);
  }, []);

  return <SupabaseContext.Provider value={supabaseClient}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
