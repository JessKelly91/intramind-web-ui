/**
 * ChatWindow Component
 * Main chat window container with header, messages, and input
 */

import { h } from 'preact';
import type { Message } from '../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  messages: Message[];
  onSendMessage: (message: string) => void;
  primaryColor: string;
  welcomeMessage: string;
  placeholder: string;
  isLoading?: boolean;
}

export default function ChatWindow({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  primaryColor,
  welcomeMessage,
  placeholder,
  isLoading,
}: ChatWindowProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '80px',
        right: '0',
        width: '380px',
        height: '600px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideIn 0.3s ease-out',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          backgroundColor: primaryColor,
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '20px' }}>🤖</div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              IntraMind
            </h3>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              AI-powered search
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px 8px',
            lineHeight: 1,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.opacity = '1';
          }}
        >
          ×
        </button>
      </div>

      {/* Message List */}
      <MessageList
        messages={messages}
        primaryColor={primaryColor}
        welcomeMessage={welcomeMessage}
        isLoading={isLoading}
      />

      {/* Input */}
      <MessageInput
        onSend={onSendMessage}
        placeholder={placeholder}
        disabled={isLoading}
        primaryColor={primaryColor}
      />
    </div>
  );
}
