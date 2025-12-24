/**
 * Main App Component for IntraMind Widget
 *
 * Manages chat state, upload state, API communication, and localStorage persistence
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { WidgetConfig, Message, UploadFile, Collection } from './types';
import { APIClient } from './services/api';
import { loadSession, saveSession, generateConversationId } from './utils/storage';
import { validateFile } from './utils/fileValidation';
import ChatButton from './components/ChatButton';
import ChatWindow from './components/ChatWindow';

interface AppProps {
  config: WidgetConfig;
}

export default function App({ config }: AppProps) {
  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'chat' | 'upload' | 'collections'>('chat');

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Upload state
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Collections state
  const [isLoadingCollections, setIsLoadingCollections] = useState(false);

  // API client
  const [apiClient] = useState(() => new APIClient(config));

  // Load session from localStorage on mount
  useEffect(() => {
    const session = loadSession(config.apiKey, config.collection || 'default');

    if (session) {
      setMessages(session.messages);
      setConversationId(session.conversationId);
      console.log('✅ Restored session from localStorage', {
        messageCount: session.messages.length,
        conversationId: session.conversationId
      });
    } else {
      // Generate new conversation ID
      const newConvId = generateConversationId();
      setConversationId(newConvId);
      console.log('✨ Started new conversation', { conversationId: newConvId });
    }

    // Set initial collection
    setSelectedCollection(config.collection || 'default');
  }, [config.apiKey, config.collection]);

  // Save session to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0 && conversationId) {
      saveSession(config.apiKey, {
        conversationId,
        messages,
        collection: config.collection || 'default',
        lastUpdated: new Date().toISOString()
      });
    }
  }, [messages, conversationId, config.apiKey, config.collection]);

  // Load collections when upload or collections tab is opened
  useEffect(() => {
    if ((currentTab === 'upload' || currentTab === 'collections') && collections.length === 0) {
      loadCollections();
    }
  }, [currentTab]);

  /**
   * Load available collections
   */
  const loadCollections = async () => {
    setIsLoadingCollections(true);
    try {
      const cols = await apiClient.getCollections();
      setCollections(cols);
      console.log('✅ Loaded collections', { count: cols.length });
    } catch (error) {
      console.error('❌ Failed to load collections:', error);
      // Set fallback collection
      setCollections([
        {
          name: config.collection || 'default',
          documentCount: 0,
          createdAt: new Date().toISOString(),
        }
      ]);
    } finally {
      setIsLoadingCollections(false);
    }
  };

  /**
   * Create a new collection
   */
  const handleCreateCollection = async (name: string, description?: string) => {
    try {
      const newCollection = await apiClient.createCollection(name, description);
      setCollections(prev => [...prev, newCollection]);
      console.log('✅ Collection created', { name });
    } catch (error) {
      console.error('❌ Failed to create collection:', error);
      alert(`Failed to create collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Delete a collection
   */
  const handleDeleteCollection = async (name: string) => {
    try {
      await apiClient.deleteCollection(name);
      setCollections(prev => prev.filter(c => c.name !== name));
      console.log('✅ Collection deleted', { name });

      // If deleted collection was selected, switch to first available
      if (selectedCollection === name && collections.length > 1) {
        setSelectedCollection(collections.find(c => c.name !== name)?.name || '');
      }
    } catch (error) {
      console.error('❌ Failed to delete collection:', error);
      alert(`Failed to delete collection: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  /**
   * Handle sending a message
   */
  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API
      const response = await apiClient.sendMessage({
        query: text,
        collection: config.collection || 'default',
        conversationId: conversationId || undefined,
      });

      // Add AI response
      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        text: response.response,
        sender: 'ai',
        timestamp: new Date(),
        searchResults: response.citations,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update conversation ID if returned from API
      if (response.conversationId && response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
      }

      console.log('✅ Message sent successfully', {
        query: text,
        responseLength: response.response.length,
        citationsCount: response.citations?.length || 0
      });
    } catch (error) {
      console.error('❌ Failed to send message:', error);

      // Add error message
      const errorMessage: Message = {
        id: `msg_${Date.now()}_error`,
        text: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        sender: 'ai',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle files selected for upload
   */
  const handleFilesSelected = (files: File[]) => {
    const newUploadFiles: UploadFile[] = files.map(file => {
      // Validate file
      const validation = validateFile(
        file,
        config.allowedFileTypes,
        config.maxFileSize
      );

      return {
        file,
        status: validation.valid ? 'pending' : 'error',
        progress: 0,
        error: validation.error,
      };
    });

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
    console.log('📁 Files selected', { count: newUploadFiles.length });
  };

  /**
   * Handle removing a file from upload queue
   */
  const handleRemoveFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * Handle retrying a failed upload
   */
  const handleRetryFile = (index: number) => {
    setUploadFiles(prev => prev.map((file, i) =>
      i === index ? { ...file, status: 'pending', progress: 0, error: undefined } : file
    ));
  };

  /**
   * Handle starting upload
   */
  const handleStartUpload = async () => {
    const filesToUpload = uploadFiles.filter(f => f.status === 'pending');

    if (filesToUpload.length === 0) return;

    setIsUploading(true);

    // Upload files in sequence (could be parallel with Promise.all)
    for (let i = 0; i < uploadFiles.length; i++) {
      const uploadFile = uploadFiles[i];

      if (uploadFile.status !== 'pending') continue;

      // Mark as uploading
      setUploadFiles(prev => prev.map((f, idx) =>
        idx === i ? { ...f, status: 'uploading', progress: 0 } : f
      ));

      try {
        await apiClient.uploadDocument({
          file: uploadFile.file,
          collection: selectedCollection,
          onProgress: (progress) => {
            setUploadFiles(prev => prev.map((f, idx) =>
              idx === i ? { ...f, progress } : f
            ));
          }
        });

        // Mark as success
        setUploadFiles(prev => prev.map((f, idx) =>
          idx === i ? { ...f, status: 'success', progress: 100 } : f
        ));

        console.log('✅ File uploaded successfully', { filename: uploadFile.file.name });
      } catch (error) {
        console.error('❌ File upload failed:', error);

        // Mark as error
        setUploadFiles(prev => prev.map((f, idx) =>
          idx === i ? {
            ...f,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          } : f
        ));
      }
    }

    setIsUploading(false);
    console.log('✅ Upload batch complete');
  };

  const showUploadTab = config.features?.upload !== false;
  const showCollectionsTab = config.features?.collections !== false;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 9999,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Inject keyframe animations */}
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.4;
            }
            50% {
              opacity: 1;
            }
          }
        `}
      </style>

      {/* Chat Window */}
      <ChatWindow
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        // Chat props
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        // Upload props
        uploadFiles={uploadFiles}
        collections={collections}
        selectedCollection={selectedCollection}
        onFilesSelected={handleFilesSelected}
        onRemoveFile={handleRemoveFile}
        onRetryFile={handleRetryFile}
        onCollectionSelect={setSelectedCollection}
        onStartUpload={handleStartUpload}
        isUploading={isUploading}
        // Collections props
        onCreateCollection={handleCreateCollection}
        onDeleteCollection={handleDeleteCollection}
        onRefreshCollections={loadCollections}
        isLoadingCollections={isLoadingCollections}
        // Common props
        primaryColor={config.primaryColor || '#4F46E5'}
        welcomeMessage={config.welcomeMessage || 'How can I help you?'}
        placeholder={config.placeholder || 'Ask a question...'}
        showUploadTab={showUploadTab}
        showCollectionsTab={showCollectionsTab}
      />

      {/* Chat Button */}
      <ChatButton
        isOpen={isOpen}
        primaryColor={config.primaryColor || '#4F46E5'}
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}
