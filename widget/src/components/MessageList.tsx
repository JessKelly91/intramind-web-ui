/**
 * MessageList Component
 * Scrollable list of chat messages
 */

import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import type { Message as MessageType } from '../types';
import Message from './Message';

interface MessageListProps {
  messages: MessageType[];
  primaryColor: string;
  welcomeMessage: string;
  isLoading?: boolean;
}

export default function MessageList({ messages, primaryColor, welcomeMessage, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div
      style={{
        flex: 1,
        padding: '16px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Welcome message if no messages */}
      {messages.length === 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            textAlign: 'center',
            color: '#666',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👋</div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: '#333' }}>
            {welcomeMessage}
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            Ask me anything about your documents
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <Message key={message.id} message={message} primaryColor={primaryColor} />
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: '#f3f4f6',
              color: '#666',
              fontSize: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#999',
                animation: 'pulse 1.5s ease-in-out infinite'
              }} />
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#999',
                animation: 'pulse 1.5s ease-in-out 0.2s infinite'
              }} />
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#999',
                animation: 'pulse 1.5s ease-in-out 0.4s infinite'
              }} />
            </div>
          </div>
        </div>
      )}

      {/* Auto-scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
