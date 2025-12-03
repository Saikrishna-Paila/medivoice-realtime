export const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export const STATUS_LABELS = {
  idle: 'Ready',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
  error: 'Error',
} as const;

export type Status = keyof typeof STATUS_LABELS;

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface MedicalSummary {
  chief_complaint: string;
  history_of_present_illness: string;
  relevant_history: string[];
  assessment: string;
  recommendations: string[];
}

export interface WSMessage {
  type: 'transcript' | 'response' | 'audio' | 'status' | 'summary' | 'error';
  text?: string;
  is_final?: boolean;
  data?: string | MedicalSummary;
  status?: Status;
  message?: string;
  format?: string;
}
