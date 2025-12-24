/**
 * Message Component
 * Individual message bubble for user or AI
 */

import { h } from 'preact';
import type { Message as MessageType } from '../types';

interface MessageProps {
  message: MessageType;
  primaryColor: string;
}

export default function Message({ message, primaryColor }: MessageProps) {
  const isUser = message.sender === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '16px',
      }}
    >
      {/* Sender label */}
      <div
        style={{
          fontSize: '11px',
          color: '#666',
          marginBottom: '4px',
          fontWeight: 500,
        }}
      >
        {isUser ? 'You' : 'IntraMind AI'}
      </div>

      {/* Message bubble */}
      <div
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: '12px',
          backgroundColor: isUser ? primaryColor : '#f3f4f6',
          color: isUser ? 'white' : '#333',
          fontSize: '14px',
          lineHeight: '1.5',
          wordWrap: 'break-word',
        }}
      >
        {message.text}
      </div>

      {/* Search results */}
      {!isUser && message.searchResults && message.searchResults.length > 0 && (
        <div
          style={{
            marginTop: '8px',
            padding: '12px',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            fontSize: '12px',
            maxWidth: '80%',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#666' }}>
            📚 Sources ({message.searchResults.length})
          </div>
          {message.searchResults.map((result, idx) => (
            <div
              key={result.id}
              style={{
                marginBottom: idx < message.searchResults!.length - 1 ? '8px' : '0',
                paddingBottom: idx < message.searchResults!.length - 1 ? '8px' : '0',
                borderBottom: idx < message.searchResults!.length - 1 ? '1px solid #e5e7eb' : 'none',
              }}
            >
              <div style={{ fontWeight: 500, color: '#333', marginBottom: '2px' }}>
                {result.title || result.metadata.source || 'Document'}
              </div>
              <div style={{ color: '#666', fontSize: '11px' }}>
                {result.metadata.collection} • Score: {(result.score * 100).toFixed(0)}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <div
        style={{
          fontSize: '10px',
          color: '#999',
          marginTop: '4px',
        }}
      >
        {time}
      </div>
    </div>
  );
}
