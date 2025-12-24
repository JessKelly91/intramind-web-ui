/**
 * FileItem Component
 * Individual file in upload queue with progress bar
 */

import { h } from 'preact';
import type { UploadFile } from '../types';
import { formatFileSize, getFileIcon } from '../utils/fileValidation';

interface FileItemProps {
  uploadFile: UploadFile;
  onRemove: () => void;
  onRetry?: () => void;
}

export default function FileItem({ uploadFile, onRemove, onRetry }: FileItemProps) {
  const { file, status, progress, error } = uploadFile;

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'uploading':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'uploading':
        return '⏳';
      default:
        return '📎';
    }
  };

  return (
    <div
      style={{
        padding: '12px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        marginBottom: '8px',
        border: `1px solid ${status === 'error' ? '#fecaca' : '#e5e7eb'}`,
      }}
    >
      {/* File info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        {/* Icon */}
        <div style={{ fontSize: '20px' }}>{getFileIcon(file.name)}</div>

        {/* File details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#333',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {file.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {formatFileSize(file.size)}
          </div>
        </div>

        {/* Status icon */}
        <div style={{ fontSize: '16px' }}>{getStatusIcon()}</div>

        {/* Remove button */}
        {status !== 'uploading' && (
          <button
            onClick={onRemove}
            style={{
              background: 'none',
              border: 'none',
              color: '#999',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.color = '#999';
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Progress bar */}
      {status === 'uploading' && (
        <div
          style={{
            height: '4px',
            backgroundColor: '#e5e7eb',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              backgroundColor: getStatusColor(),
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      )}

      {/* Status text */}
      {status === 'uploading' && (
        <div
          style={{
            fontSize: '12px',
            color: '#666',
            marginTop: '4px',
            textAlign: 'right',
          }}
        >
          {Math.round(progress)}%
        </div>
      )}

      {/* Error message with retry */}
      {status === 'error' && error && (
        <div style={{ marginTop: '8px' }}>
          <div
            style={{
              fontSize: '12px',
              color: '#ef4444',
              marginBottom: '4px',
            }}
          >
            {error}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                fontSize: '12px',
                color: '#3b82f6',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0',
                textDecoration: 'underline',
              }}
            >
              Retry upload
            </button>
          )}
        </div>
      )}

      {/* Success message */}
      {status === 'success' && (
        <div
          style={{
            fontSize: '12px',
            color: '#10b981',
            marginTop: '4px',
          }}
        >
          Upload complete
        </div>
      )}
    </div>
  );
}
