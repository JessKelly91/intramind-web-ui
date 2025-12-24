/**
 * MessageInput Component
 * Input field with send button for chat messages
 */

import { h } from 'preact';
import { useState } from 'preact/hooks';

interface MessageInputProps {
  onSend: (message: string) => void;
  placeholder: string;
  disabled?: boolean;
  primaryColor: string;
}

export default function MessageInput({ onSend, placeholder, disabled, primaryColor }: MessageInputProps) {
  const [input, setInput] = useState('');

  const handleSend = () => {
    const message = input.trim();
    if (message && !disabled) {
      onSend(message);
      setInput('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      style={{
        padding: '16px',
        borderTop: '1px solid #e5e7eb',
        backgroundColor: '#fafafa',
        display: 'flex',
        gap: '8px',
      }}
    >
      <input
        type="text"
        value={input}
        onInput={(e) => setInput((e.target as HTMLInputElement).value)}
        onKeyPress={handleKeyPress as any}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          flex: 1,
          padding: '12px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          backgroundColor: 'white',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          (e.target as HTMLInputElement).style.borderColor = primaryColor;
        }}
        onBlur={(e) => {
          (e.target as HTMLInputElement).style.borderColor = '#e5e7eb';
        }}
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        style={{
          padding: '12px 20px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: disabled || !input.trim() ? '#d1d5db' : primaryColor,
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!disabled && input.trim()) {
            (e.target as HTMLButtonElement).style.opacity = '0.9';
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.opacity = '1';
        }}
      >
        Send
      </button>
    </div>
  );
}
