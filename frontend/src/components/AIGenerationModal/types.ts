/**
 * AI Generation Modal Types
 */

export type LanguageType = 'ko' | 'en' | 'ch' | 've' | 'ja';

export interface AIGenerationInput {
  id: string; // 임시 ID (행 식별용)
  term_key: string;
  content: string;
  description: string;
  language: LanguageType;
  actions: string | null;
}

export interface AIGenerationResult {
  id: string; // input id와 매칭
  term_key: string;
  ko: string;
  en: string;
  ch: string;
  ve: string;
  ja: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  actions: string | null;
}

export interface SSEMessage {
  type: 'start' | 'progress' | 'complete' | 'error';
  id: string;
  data?: Partial<AIGenerationResult>;
  error?: string;
}