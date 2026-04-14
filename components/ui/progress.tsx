'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export function Progress({ value, label }: { value: number; label?: string }) {
  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-medium text-slate-100">{label}</p> : null}
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className={cn('h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all')} style={{ width: `${value}%` }} />
      </div>
      <p className="text-xs text-slate-400">{value}%</p>
    </div>
  );
}
