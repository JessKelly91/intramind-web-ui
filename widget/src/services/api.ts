/**
 * API Client for IntraMind Widget
 * Handles all communication with the backend API
 */

import type { WidgetConfig, Message, Collection, SearchResult } from '../types';

export interface ChatRequest {
  query: string;
  collection: string;
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  citations: SearchResult[];
  conversationId: string;
  queryComplexity?: 'simple' | 'complex';
}

export interface UploadRequest {
  file: File;
  collection: string;
  onProgress?: (progress: number) => void;
}

export interface UploadResponse {
  success: boolean;
  documentId?: string;
  chunksStored?: number;
  error?: string;
}

/**
 * API Client class
 */
export class APIClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(config: WidgetConfig) {
    this.apiUrl = config.apiUrl || 'http://localhost:8001';
    this.apiKey = config.apiKey;
  }

  /**
   * Get default headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };
  }

  /**
   * Handle API errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `API request failed: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Send a chat message
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.apiUrl}/api/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ChatResponse>(response);
  }

  /**
   * Upload a document
   */
  async uploadDocument(request: UploadRequest): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('collection', request.collection);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && request.onProgress) {
          const progress = (e.loaded / e.total) * 100;
          request.onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            resolve({ success: false, error: 'Invalid response from server' });
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            resolve({ success: false, error: error.error || 'Upload failed' });
          } catch {
            resolve({ success: false, error: `Upload failed: ${xhr.statusText}` });
          }
        }
      });

      xhr.addEventListener('error', () => {
        resolve({ success: false, error: 'Network error during upload' });
      });

      xhr.open('POST', `${this.apiUrl}/api/upload`);
      xhr.setRequestHeader('X-API-Key', this.apiKey);
      xhr.send(formData);
    });
  }

  /**
   * Get list of collections
   */
  async getCollections(): Promise<Collection[]> {
    const response = await fetch(`${this.apiUrl}/api/collections`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<Collection[]>(response);
  }

  /**
   * Create a new collection
   */
  async createCollection(name: string, description?: string): Promise<Collection> {
    const response = await fetch(`${this.apiUrl}/api/collections`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ name, description }),
    });

    return this.handleResponse<Collection>(response);
  }

  /**
   * Delete a collection
   */
  async deleteCollection(name: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/api/collections/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Failed to delete collection: ${response.statusText}`);
    }
  }

  /**
   * Validate API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/api/validate`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

