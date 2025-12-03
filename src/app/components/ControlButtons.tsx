'use client';

import { cn } from '@/lib/utils';

interface ControlButtonsProps {
  isSessionActive: boolean;
  onStart: () => void;
  onEnd: () => void;
  disabled?: boolean;
}

export function ControlButtons({
  isSessionActive,
  onStart,
  onEnd,
  disabled = false,
}: ControlButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-6">
      {!isSessionActive ? (
        <button
          onClick={onStart}
          disabled={disabled}
          className={cn(
            'group relative overflow-hidden',
            'px-12 py-5 rounded-2xl font-semibold text-lg',
            'bg-gradient-to-r from-cyan-500 via-cyan-500 to-teal-500',
            'text-white shadow-2xl',
            'transition-all duration-300 ease-out',
            'hover:shadow-cyan-500/40 hover:shadow-[0_0_40px_rgba(6,182,212,0.4)]',
            'hover:scale-[1.03] active:scale-[0.98]',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-2xl'
          )}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

          {/* Button content */}
          <span className="relative flex items-center gap-4">
            {/* Animated microphone icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-md group-hover:scale-150 transition-transform duration-300" />
              <svg
                className="relative w-7 h-7 transition-transform duration-300 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <span className="tracking-wide">Start Conversation</span>
          </span>

          {/* Bottom glow line */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>
      ) : (
        <div className="flex items-center gap-4">
          {/* Recording indicator */}
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl glass-card">
            <div className="relative">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping opacity-50" />
            </div>
            <span className="text-sm font-medium text-slate-300">Session Active</span>
          </div>

          {/* End session button */}
          <button
            onClick={onEnd}
            disabled={disabled}
            className={cn(
              'group relative overflow-hidden',
              'px-10 py-5 rounded-2xl font-semibold text-lg',
              'bg-gradient-to-r from-red-500 via-red-500 to-rose-600',
              'text-white shadow-2xl',
              'transition-all duration-300 ease-out',
              'hover:shadow-red-500/40 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]',
              'hover:scale-[1.03] active:scale-[0.98]',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100'
            )}
          >
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />

            {/* Button content */}
            <span className="relative flex items-center gap-3">
              <svg
                className="w-6 h-6 transition-transform duration-300 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                />
              </svg>
              <span className="tracking-wide">End Session</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
