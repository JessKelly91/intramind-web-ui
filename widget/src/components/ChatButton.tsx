/**
 * ChatButton Component
 * Floating button that opens/closes the chat window
 */

import { h } from 'preact';

interface ChatButtonProps {
  isOpen: boolean;
  primaryColor: string;
  onClick: () => void;
}

export default function ChatButton({ isOpen, primaryColor, onClick }: ChatButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Close chat' : 'Open chat'}
      style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: primaryColor,
        color: 'white',
        fontSize: '24px',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isOpen ? 'scale(0.9)' : 'scale(1)',
      }}
      onMouseEnter={(e) => {
        (e.target as HTMLButtonElement).style.transform = isOpen ? 'scale(0.85)' : 'scale(1.05)';
        (e.target as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.transform = isOpen ? 'scale(0.9)' : 'scale(1)';
        (e.target as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
    >
      {isOpen ? '×' : '💬'}
    </button>
  );
}
