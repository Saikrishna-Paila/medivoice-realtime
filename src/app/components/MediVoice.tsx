'use client';

import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { StatusIndicator } from './StatusIndicator';
import { VoiceVisualizer } from './VoiceVisualizer';
import { LiveTranscript } from './LiveTranscript';
import { ConversationPanel } from './ConversationPanel';
import { ControlButtons } from './ControlButtons';
import { SessionSummary } from './SessionSummary';

export function MediVoice() {
  const {
    status,
    isSessionActive,
    currentTranscript,
    conversation,
    summary,
    error,
    listening,
    userSpeaking,
    startSession,
    endSession,
  } = useVoiceAgent();

  // If we have a summary, show it
  if (summary) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <SessionSummary
          summary={summary}
          onNewSession={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Error display */}
      {error && (
        <div className="relative overflow-hidden p-4 glass-card rounded-xl border border-red-500/30 glow-red">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-red-400 text-sm">Connection Error</p>
              <p className="text-xs text-red-300/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Layout - Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column - Voice Visualizer & Controls */}
        <div className="glass-card rounded-2xl p-5 flex flex-col">
          {/* Status indicator at top */}
          <div className="flex justify-center mb-4">
            <StatusIndicator status={status} />
          </div>

          {/* Voice Visualizer - centered */}
          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            <VoiceVisualizer
              isActive={isSessionActive}
              userSpeaking={userSpeaking}
            />
          </div>

          {/* Control Buttons */}
          <div className="mt-4">
            <ControlButtons
              isSessionActive={isSessionActive}
              onStart={startSession}
              onEnd={endSession}
            />
          </div>
        </div>

        {/* Right Column - Live Transcript & Quick Instructions */}
        <div className="flex flex-col gap-4">
          {/* Live Transcript - takes most space */}
          <div className="flex-1">
            <LiveTranscript
              text={currentTranscript}
              isListening={listening && isSessionActive}
            />
          </div>

          {/* Quick Instructions when not active */}
          {!isSessionActive && (
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center justify-around">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center border border-cyan-500/30">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400">Click Start</span>
                </div>
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400">Speak</span>
                </div>
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center border border-purple-500/30">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs text-slate-400">Get Summary</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom - Conversation History (full width) */}
      <div className="w-full">
        <ConversationPanel messages={conversation} />
      </div>

      {/* Compact Disclaimer */}
      <div className="glass-card rounded-xl px-4 py-3 border border-amber-500/20">
        <div className="flex items-center gap-3">
          <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-slate-400">
            <span className="text-amber-400 font-medium">Disclaimer:</span> MediVoice is an AI assistant. Not a replacement for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
