/**
 * ChatWindow Component
 * Main chat window container with tabs for chat and upload
 */

import { h } from 'preact';
import type { Message, UploadFile, Collection } from '../types';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import UploadTab from './UploadTab';

interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: 'chat' | 'upload';
  onTabChange: (tab: 'chat' | 'upload') => void;

  // Chat props
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;

  // Upload props
  uploadFiles: UploadFile[];
  collections: Collection[];
  selectedCollection: string;
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onRetryFile: (index: number) => void;
  onCollectionSelect: (collection: string) => void;
  onStartUpload: () => void;
  isUploading: boolean;

  // Common props
  primaryColor: string;
  welcomeMessage: string;
  placeholder: string;
  showUploadTab: boolean;
}

export default function ChatWindow(props: ChatWindowProps) {
  if (!props.isOpen) return null;

  const {
    onClose,
    currentTab,
    onTabChange,
    primaryColor,
    showUploadTab,
  } = props;

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
          backgroundColor: primaryColor,
          color: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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

        {/* Tab navigation */}
        {showUploadTab && (
          <div
            style={{
              display: 'flex',
              borderTop: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            <button
              onClick={() => onTabChange('chat')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: currentTab === 'chat' ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                borderBottom: currentTab === 'chat' ? '3px solid white' : '3px solid transparent',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              💬 Chat
            </button>
            <button
              onClick={() => onTabChange('upload')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: currentTab === 'upload' ? 'rgba(255,255,255,0.2)' : 'transparent',
                border: 'none',
                borderBottom: currentTab === 'upload' ? '3px solid white' : '3px solid transparent',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              📤 Upload
            </button>
          </div>
        )}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {currentTab === 'chat' ? (
          <>
            {/* Message List */}
            <MessageList
              messages={props.messages}
              primaryColor={primaryColor}
              welcomeMessage={props.welcomeMessage}
              isLoading={props.isLoading}
            />

            {/* Input */}
            <MessageInput
              onSend={props.onSendMessage}
              placeholder={props.placeholder}
              disabled={props.isLoading}
              primaryColor={primaryColor}
            />
          </>
        ) : (
          /* Upload Tab */
          <UploadTab
            uploadFiles={props.uploadFiles}
            collections={props.collections}
            selectedCollection={props.selectedCollection}
            onFilesSelected={props.onFilesSelected}
            onRemoveFile={props.onRemoveFile}
            onRetryFile={props.onRetryFile}
            onCollectionSelect={props.onCollectionSelect}
            onStartUpload={props.onStartUpload}
            isUploading={props.isUploading}
            primaryColor={primaryColor}
          />
        )}
      </div>
    </div>
  );
}
