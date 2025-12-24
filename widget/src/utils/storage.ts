/**
 * LocalStorage utility for persisting chat state
 */

import type { Message } from '../types';

const STORAGE_KEY_PREFIX = 'intramind_';

export interface StoredSession {
  conversationId: string;
  messages: Message[];
  collection: string;
  lastUpdated: string;
}

/**
 * Get storage key for a specific API key
 */
function getStorageKey(apiKey: string): string {
  // Use a hash of the API key to avoid storing the actual key
  const hash = apiKey.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  return `${STORAGE_KEY_PREFIX}session_${Math.abs(hash)}`;
}

/**
 * Load session from localStorage
 */
export function loadSession(apiKey: string, collection: string): StoredSession | null {
  try {
    const key = getStorageKey(apiKey);
    const data = localStorage.getItem(key);

    if (!data) return null;

    const session: StoredSession = JSON.parse(data);

    // Only return session if it matches the current collection
    if (session.collection !== collection) {
      return null;
    }

    // Convert timestamp strings back to Date objects
    session.messages = session.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));

    return session;
  } catch (error) {
    console.error('Failed to load session from localStorage:', error);
    return null;
  }
}

/**
 * Save session to localStorage
 */
export function saveSession(apiKey: string, session: StoredSession): void {
  try {
    const key = getStorageKey(apiKey);
    const data = JSON.stringify({
      ...session,
      lastUpdated: new Date().toISOString()
    });
    localStorage.setItem(key, data);
  } catch (error) {
    console.error('Failed to save session to localStorage:', error);
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession(apiKey: string): void {
  try {
    const key = getStorageKey(apiKey);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear session from localStorage:', error);
  }
}

/**
 * Generate a unique conversation ID
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
