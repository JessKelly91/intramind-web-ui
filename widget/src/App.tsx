/**
 * Main App Component for IntraMind Widget
 * 
 * This is the root component that will be rendered inside the Shadow DOM.
 * Phase 1 will expand this with actual UI components.
 */

import { h } from 'preact';
import { useState } from 'preact/hooks';
import type { WidgetConfig } from './types';

interface AppProps {
  config: WidgetConfig;
}

export default function App({ config }: AppProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Chat Button - Will be extracted to component in Phase 2 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: config.primaryColor || '#4F46E5',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        💬
      </button>

      {/* Chat Window - Will be expanded in Phase 2 */}
      {isOpen && (
        <div style={{
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
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            backgroundColor: config.primaryColor || '#4F46E5',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
              IntraMind
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '4px 8px'
              }}
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto'
          }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Welcome to IntraMind! 🎉
            </p>
            <p style={{ color: '#999', fontSize: '12px', marginTop: '8px' }}>
              Widget is initializing... Full functionality coming in Phase 2!
            </p>
            <div style={{ 
              marginTop: '16px', 
              padding: '12px', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '8px',
              fontSize: '12px',
              color: '#666'
            }}>
              <strong>Config:</strong>
              <pre style={{ marginTop: '8px', fontSize: '11px', overflow: 'auto' }}>
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          </div>

          {/* Input - placeholder */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <input
              type="text"
              placeholder={config.placeholder || 'Ask a question...'}
              disabled
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb',
                cursor: 'not-allowed'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

