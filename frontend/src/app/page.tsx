'use client';

import { MediVoice } from './components/MediVoice';

export default function Home() {
  return (
    <>
      {/* Animated background */}
      <div className="bg-animated" />

      <main className="min-h-screen py-4 px-4 relative">
        {/* Compact Header */}
        <header className="max-w-6xl mx-auto mb-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              {/* Animated Medical Icon */}
              <div className="relative">
                <div className="absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 opacity-30 blur-md" />
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 flex items-center justify-center glow-cyan">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold gradient-text tracking-tight">
                  MediVoice
                </h1>
                <p className="text-xs text-slate-500">AI Medical Voice Assistant</p>
              </div>
            </div>

            {/* Feature badges - horizontal */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <svg className="w-3.5 h-3.5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Real-time</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <svg className="w-3.5 h-3.5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Natural Voice</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                <svg className="w-3.5 h-3.5 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Auto Summary</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full border border-cyan-500/30">
                AI
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                Voice
              </span>
            </div>
          </div>

          {/* Decorative line */}
          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        </header>

        {/* Main Content */}
        <MediVoice />
      </main>
    </>
  );
}
