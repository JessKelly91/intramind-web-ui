/**
 * Main App Component for IntraMind Widget
 *
 * Manages chat state, API communication, and localStorage persistence
 */

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { WidgetConfig, Message } from './types';
import { APIClient } from './services/api';
import { loadSession, saveSession, generateConversationId } from './utils/storage';
import ChatButton from './components/ChatButton';
import ChatWindow from './components/ChatWindow';

interface AppProps {
  config: WidgetConfig;
}

export default function App({ config }: AppProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
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
        messages={messages}
        onSendMessage={handleSendMessage}
        primaryColor={config.primaryColor || '#4F46E5'}
        welcomeMessage={config.welcomeMessage || 'How can I help you?'}
        placeholder={config.placeholder || 'Ask a question...'}
        isLoading={isLoading}
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
