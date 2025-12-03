'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/constants';
import { formatTime, cn } from '@/lib/utils';

interface ConversationPanelProps {
  messages: Message[];
}

export function ConversationPanel({ messages }: ConversationPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="w-full flex flex-col glass-card rounded-2xl overflow-hidden">
      {/* Header with gradient border */}
      <div className="px-5 py-4 border-b border-cyan-500/20 bg-gradient-to-r from-slate-800/50 to-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 rounded-lg blur-sm" />
            <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Conversation History</h3>
            <p className="text-xs text-slate-500">{messages.length} message{messages.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[250px] min-h-[150px]"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            {/* Empty state with animation */}
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 bg-cyan-500/10 rounded-full blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-slate-600/50">
                <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 font-medium">No messages yet</p>
            <p className="text-sm text-slate-500 mt-1">Start a conversation to see the history</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3 message-appear',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Avatar with glow */}
              <div className="relative flex-shrink-0">
                {message.role === 'assistant' && (
                  <div className="absolute inset-0 bg-cyan-500/30 rounded-xl blur-md" />
                )}
                <div
                  className={cn(
                    'relative w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg',
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-gradient-to-br from-cyan-500 to-teal-600'
                  )}
                >
                  {message.role === 'user' ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Message bubble with enhanced styling */}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 hover:shadow-xl',
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-md'
                    : 'bg-gradient-to-br from-slate-700/90 to-slate-800/90 text-slate-100 rounded-bl-md border border-slate-600/30'
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className={cn(
                  'flex items-center gap-2 mt-2',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}>
                  <svg className={cn(
                    'w-3 h-3',
                    message.role === 'user' ? 'text-blue-300' : 'text-slate-500'
                  )} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span
                    className={cn(
                      'text-xs',
                      message.role === 'user' ? 'text-blue-200' : 'text-slate-400'
                    )}
                  >
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom gradient fade */}
      <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
    </div>
  );
}
