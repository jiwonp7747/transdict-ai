import {
  AIGenerationRequest,
  AIGenerationResponse,
  DictionaryListResponse
} from '../types/dictionary';
import config from "../config";

/**
 * AI Dictionary Service
 * Handles communication with AI backend for dictionary management
 */

class DictionaryService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl
  }

  /**
   * Create dictionary entry using AI
   * @param request - AI generation request data
   * @returns Promise with generation response
   */
  async createDictByAi(request: AIGenerationRequest): Promise<AIGenerationResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/dictionary/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get dictionary list for specific context
   * @param context_id - Context ID to fetch dictionaries for
   * @returns Promise with dictionary list response
   */
  async getDictList(context_id: number): Promise<DictionaryListResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/dictionary/context/${context_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch dictionary list',
      };
    }
  }

  /**
   * Create multiple dictionary entries
   * @param dictionaries - Array of dictionary items to create
   * @returns Promise with creation response
   */
  async createDictList(dictionaries: Array<{
    term_key?: string | null;
    description?: string | null;
    context_id?: number | null;
    ko?: string | null;
    en?: string | null;
    ch?: string | null;
    ve?: string | null;
    ja?: string | null;
  }>): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/dictionary/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dictionaries),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      await response.json();

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create dictionary list',
      };
    }
  }

  /**
   * Update dictionary entry
   * @param dict_id - Dictionary ID to update
   * @param data - Dictionary data to update
   * @returns Promise with update response
   */
  async updateDict(dict_id: number, data: {
    term_key?: string | null;
    description?: string | null;
    context_id?: number | null;
    ko?: string | null;
    en?: string | null;
    ch?: string | null;
    ve?: string | null;
    ja?: string | null;
    updated_at?: string | null;
  }): Promise<{ success: boolean; error?: string; data?: any }> {
    try {
      const response = await fetch(`${this.baseUrl}/dictionary/${dict_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      console.log(responseData);

      if (!response.ok) {
        // Use the message from the already parsed response data
        throw new Error(responseData.message || `API error: ${response.status}`);
      }

      return {
        success: true,
        data: responseData.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update dictionary entry',
      };
    }
  }

  /**
   * Delete dictionary entry
   * @param dict_id - Dictionary ID to delete
   * @returns Promise with deletion response
   */
  async deleteDict(dict_id: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/dictionary/${dict_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete dictionary entry',
      };
    }
  }
}

// Export singleton instance
export const dictionaryService = new DictionaryService();
export default dictionaryService;
