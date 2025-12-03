'use client';

import { MedicalSummary } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SessionSummaryProps {
  summary: MedicalSummary;
  onNewSession: () => void;
}

export function SessionSummary({ summary, onNewSession }: SessionSummaryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = formatSummaryAsText(summary);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = formatSummaryAsText(summary);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-summary-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full glass-card rounded-3xl overflow-hidden message-appear">
      {/* Header with gradient */}
      <div className="relative px-6 py-5 bg-gradient-to-r from-cyan-600 via-cyan-500 to-teal-500 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Session Summary</h2>
            <p className="text-cyan-100 text-sm mt-0.5">Medical documentation from your conversation</p>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="p-6 space-y-6">
        {/* Chief Complaint */}
        <SummarySection
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          title="Chief Complaint"
          iconColor="from-red-500 to-rose-600"
        >
          <p className="text-slate-200">{summary.chief_complaint}</p>
        </SummarySection>

        {/* History of Present Illness */}
        <SummarySection
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          title="History of Present Illness"
          iconColor="from-cyan-500 to-teal-600"
        >
          <p className="text-slate-200 leading-relaxed">{summary.history_of_present_illness}</p>
        </SummarySection>

        {/* Relevant History */}
        {summary.relevant_history.length > 0 && (
          <SummarySection
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            title="Relevant History"
            iconColor="from-purple-500 to-indigo-600"
          >
            <ul className="space-y-2">
              {summary.relevant_history.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-200">
                  <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-400 mt-2" />
                  {item}
                </li>
              ))}
            </ul>
          </SummarySection>
        )}

        {/* Assessment */}
        <SummarySection
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
          title="Assessment"
          iconColor="from-emerald-500 to-green-600"
        >
          <p className="text-slate-200">{summary.assessment}</p>
        </SummarySection>

        {/* Recommendations */}
        {summary.recommendations.length > 0 && (
          <SummarySection
            icon={
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            title="Recommendations"
            iconColor="from-amber-500 to-orange-600"
          >
            <ul className="space-y-2">
              {summary.recommendations.map((item, index) => (
                <li key={index} className="flex items-start gap-3 text-slate-200">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs text-amber-400 font-medium mt-0.5">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </SummarySection>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mx-6 mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs text-amber-200/80 leading-relaxed">
            <strong className="text-amber-400">Disclaimer:</strong> This summary is AI-generated and is not a substitute for
            professional medical advice, diagnosis, or treatment. Always consult a qualified
            healthcare provider.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700/50 flex flex-wrap gap-3">
        <button
          onClick={handleDownload}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium text-sm",
            "bg-slate-700/50 text-slate-200 border border-slate-600/50",
            "hover:bg-slate-700 hover:border-slate-500/50",
            "transition-all duration-200 flex items-center gap-2"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>

        <button
          onClick={handleCopy}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium text-sm",
            "bg-slate-700/50 text-slate-200 border border-slate-600/50",
            "hover:bg-slate-700 hover:border-slate-500/50",
            "transition-all duration-200 flex items-center gap-2",
            copied && "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
          )}
        >
          {copied ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>

        <button
          onClick={onNewSession}
          className={cn(
            "px-5 py-2.5 rounded-xl font-medium text-sm ml-auto",
            "bg-gradient-to-r from-cyan-500 to-teal-500 text-white",
            "hover:shadow-lg hover:shadow-cyan-500/25",
            "transition-all duration-200 flex items-center gap-2"
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Session
        </button>
      </div>
    </div>
  );
}

interface SummarySectionProps {
  icon: React.ReactNode;
  title: string;
  iconColor: string;
  children: React.ReactNode;
}

function SummarySection({ icon, title, iconColor, children }: SummarySectionProps) {
  return (
    <section className="glass-card-hover rounded-xl p-4 border border-slate-700/30">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center text-white",
          `bg-gradient-to-br ${iconColor}`
        )}>
          {icon}
        </div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="pl-11">
        {children}
      </div>
    </section>
  );
}

function formatSummaryAsText(summary: MedicalSummary): string {
  return `MEDICAL SUMMARY
Generated: ${new Date().toLocaleString()}

CHIEF COMPLAINT
${summary.chief_complaint}

HISTORY OF PRESENT ILLNESS
${summary.history_of_present_illness}

RELEVANT HISTORY
${summary.relevant_history.map(item => `- ${item}`).join('\n')}

ASSESSMENT
${summary.assessment}

RECOMMENDATIONS
${summary.recommendations.map(item => `- ${item}`).join('\n')}

---
Disclaimer: This summary is AI-generated and is not a substitute for professional medical advice.
`;
}
