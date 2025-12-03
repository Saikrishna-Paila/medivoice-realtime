'use client';

import { STATUS_LABELS, Status } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: Status;
}

const STATUS_CONFIG: Record<Status, {
  bg: string;
  glow: string;
  text: string;
  icon: JSX.Element;
  bgGradient: string;
}> = {
  idle: {
    bg: 'bg-slate-500',
    glow: '',
    text: 'text-slate-400',
    bgGradient: 'from-slate-600 to-slate-700',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  listening: {
    bg: 'bg-cyan-500',
    glow: 'glow-cyan',
    text: 'text-cyan-400',
    bgGradient: 'from-cyan-500 to-cyan-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
  thinking: {
    bg: 'bg-amber-500',
    glow: 'glow-amber',
    text: 'text-amber-400',
    bgGradient: 'from-amber-500 to-orange-500',
    icon: (
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  speaking: {
    bg: 'bg-emerald-500',
    glow: 'glow-green',
    text: 'text-emerald-400',
    bgGradient: 'from-emerald-500 to-green-500',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
      </svg>
    ),
  },
  error: {
    bg: 'bg-red-500',
    glow: 'glow-red',
    text: 'text-red-400',
    bgGradient: 'from-red-500 to-rose-600',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const isAnimated = status === 'listening' || status === 'speaking' || status === 'thinking';

  return (
    <div className={cn(
      'inline-flex items-center gap-3 px-5 py-3 rounded-2xl glass-card transition-all duration-300',
      config.glow
    )}>
      {/* Icon with background */}
      <div className="relative">
        {/* Pulse animation for active states */}
        {isAnimated && (
          <div className={cn(
            'absolute inset-0 rounded-xl animate-ping opacity-40',
            `bg-gradient-to-br ${config.bgGradient}`
          )} />
        )}

        {/* Icon container */}
        <div className={cn(
          'relative w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg',
          `bg-gradient-to-br ${config.bgGradient}`
        )}>
          {config.icon}
        </div>
      </div>

      {/* Status text */}
      <div className="flex flex-col">
        <span className={cn('text-sm font-semibold', config.text)}>
          {STATUS_LABELS[status]}
        </span>
        <span className="text-xs text-slate-500">
          {status === 'listening' && 'Speak now...'}
          {status === 'thinking' && 'Processing...'}
          {status === 'speaking' && 'AI responding...'}
          {status === 'idle' && 'Ready to start'}
          {status === 'error' && 'Please try again'}
        </span>
      </div>

      {/* Active indicator dot */}
      {isAnimated && (
        <div className="flex gap-1 ml-2">
          <div className={cn('w-1.5 h-1.5 rounded-full typing-dot', config.bg)} />
          <div className={cn('w-1.5 h-1.5 rounded-full typing-dot', config.bg)} />
          <div className={cn('w-1.5 h-1.5 rounded-full typing-dot', config.bg)} />
        </div>
      )}
    </div>
  );
}
