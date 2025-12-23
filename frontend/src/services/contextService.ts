import {
  Context,
  ContextUpdate,
  DictionaryEntry,
  ContextListResponse,
  DictionaryListResponse
} from '../types/context';
import config from "../config";

/**
 * API Service for Context and Dictionary
 */
class ContextService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.apiUrl
  }

  /**
   * Get all contexts
   */
  async getContexts(): Promise<ContextListResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/context`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      console.log("fetch contexts data: {}", response)

      return await response.json();
    } catch (error) {
      console.error('Failed to get contexts:', error);
      throw error;
    }
  }

  /**
   * Get dictionary entries for a specific context
   */
  async getDictionaryByContext(contextId: number): Promise<DictionaryListResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/dictionary/context/${contextId}`,
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

      return await response.json();
    } catch (error) {
      console.error('Failed to get dictionary entries:', error);
      throw error;
    }
  }

  /**
   * Create a new context
   */
  async createContext(context: Omit<Context, 'context_id' | 'created_at' | 'updated_at'>): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create context:', error);
      throw error;
    }
  }

  /**
   * Update an existing context
   */
  async updateContext(contextId: number, context: ContextUpdate): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/context/${contextId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(context),
      });

      const responseData = await response.json();
      console.log(responseData);

      if (!response.ok) {
        // Use the message from the already parsed response data
        throw new Error(responseData.message || `API error: ${response.status}`);
      }

      return responseData;
    } catch (error) {
      console.error('Failed to update context:', error);
      throw error;
    }
  }

  /**
   * Delete a context
   */
  async deleteContext(contextId: number): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/context/${contextId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to delete context:', error);
      throw error;
    }
  }

  /**
   * Create a new dictionary entry
   */
  async createDictionaryEntry(
    entry: Omit<DictionaryEntry, 'dict_id' | 'created_at'>
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/dictionary/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create dictionary entry:', error);
      throw error;
    }
  }
}

export const contextService = new ContextService();
export default contextService;
