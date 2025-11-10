/**
 * TypeScript type definitions for IntraMind Widget
 */

/**
 * Widget configuration options
 */
export interface WidgetConfig {
  // Required
  apiKey: string;
  
  // Optional configuration
  collection?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  primaryColor?: string;
  
  // Feature toggles
  features?: {
    chat?: boolean;
    upload?: boolean;
    collections?: boolean;
  };
  
  // Text customization
  placeholder?: string;
  welcomeMessage?: string;
  
  // Advanced options
  apiUrl?: string;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

/**
 * Message in the chat
 */
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  searchResults?: SearchResult[];
}

/**
 * Search result from AI Agent
 */
export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  metadata: {
    collection: string;
    source?: string;
    date?: string;
    [key: string]: any;
  };
}

/**
 * Collection information
 */
export interface Collection {
  name: string;
  documentCount: number;
  createdAt: string;
  description?: string;
}

/**
 * Upload file information
 */
export interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

/**
 * Widget state
 */
export interface WidgetState {
  isOpen: boolean;
  isMinimized: boolean;
  currentTab: 'chat' | 'upload' | 'collections';
  messages: Message[];
  collections: Collection[];
  uploadFiles: UploadFile[];
}

