/**
 * Core types for AI Dictionary Interface
 */

export interface Word {
  id: string;
  word: string;
  phonetic?: string;
  audioUrl?: string;
}

export interface Definition {
  id: string;
  partOfSpeech: string;
  definition: string;
  aiGenerated: boolean;
  confidence?: number;
}

export interface Example {
  id: string;
  sentence: string;
  translation?: string;
  source?: string;
}

export interface RelatedWord {
  word: string;
  relationship: 'synonym' | 'antonym' | 'related';
  score?: number;
}

export interface DictionaryEntry {
  word: Word;
  definitions: Definition[];
  examples: Example[];
  relatedWords: RelatedWord[];
  timestamp: number;
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: number;
  resultCount: number;
}

export interface SearchState {
  query: string;
  isLoading: boolean;
  error: string | null;
  results: DictionaryEntry | null;
}

export interface AIResponse {
  success: boolean;
  data?: DictionaryEntry;
  error?: string;
  processingTime?: number;
}

// AI Dictionary Generation Types
export type LanguageType = 'ko' | 'en' | 'ja' | 've' | 'ch';

export interface AIGenerationRequest {
  context_id: number;
  content: string;
  language: LanguageType;
  term_key: string;
  description: string;
}

export interface DictionaryListItem {
  id: number;
  context_id: number;
  term_key: string;
  content: string;
  language: LanguageType;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DictionaryListResponse {
  success: boolean;
  data?: DictionaryListItem[];
  error?: string;
}

export interface AIGenerationResponse {
  success: boolean;
  data?: DictionaryListItem;
  error?: string;
}
