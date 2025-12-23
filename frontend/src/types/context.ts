/**
 * Types for Context and Dictionary data
 */

export interface Context {
  context_id: number;
  context_name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ContextUpdate {
  context_name?: string;
  description?: string;
  updated_at?: string;
}

export interface DictionaryEntry {
  dict_id: number;
  term_key: string;
  description: string;
  context_id: number;
  ko: string;
  en: string;
  ch: string;
  ve: string;
  ja: string;
  created_at: string;
  updated_at: string;
  actions: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  status_code: number;
}

export interface ContextListResponse extends ApiResponse<Context[]> {}
export interface DictionaryListResponse extends ApiResponse<DictionaryEntry[]> {}
