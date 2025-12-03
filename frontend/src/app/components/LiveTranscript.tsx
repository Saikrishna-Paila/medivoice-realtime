'use client';

import { cn } from '@/lib/utils';

interface LiveTranscriptProps {
  text: string;
  isListening: boolean;
}

export function LiveTranscript({ text, isListening }: LiveTranscriptProps) {
  return (
    <div className={cn(
      "w-full h-full glass-card rounded-2xl flex flex-col overflow-hidden transition-all duration-300",
      isListening && "border-cyan-500/30 glow-cyan"
    )}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              {isListening && (
                <div className="absolute inset-0 bg-cyan-500/40 rounded-lg blur-md animate-pulse" />
              )}
              <div className={cn(
                "relative w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300",
                isListening
                  ? "bg-gradient-to-br from-cyan-500 to-teal-600"
                  : "bg-gradient-to-br from-slate-600 to-slate-700"
              )}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Live Transcription
            </span>
          </div>
          {isListening && (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-xs text-cyan-400 font-medium">Recording</span>
            </div>
          )}
        </div>
      </div>

      {/* Content - scrollable */}
      <div className="flex-1 p-4 overflow-y-auto min-h-[200px]">
        <div className={cn(
          "relative",
          isListening && text && "shimmer"
        )}>
          {text ? (
            <p className="text-slate-200 text-base leading-relaxed">
              {text}
              {isListening && (
                <span className="inline-block w-0.5 h-4 bg-cyan-500 ml-1 animate-pulse" />
              )}
            </p>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              {isListening ? (
                <>
                  {/* Animated waveform indicator */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(7)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-cyan-500 rounded-full animate-pulse"
                        style={{
                          height: `${16 + Math.sin(i * 1.2) * 10}px`,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-cyan-400 text-sm">Listening for speech...</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <span className="text-slate-500 text-sm">Start a session to begin</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className={cn(
        "h-0.5 transition-all duration-300",
        isListening
          ? "bg-gradient-to-r from-cyan-500 via-teal-500 to-cyan-500"
          : "bg-gradient-to-r from-transparent via-slate-700 to-transparent"
      )} />
    </div>
  );
}
