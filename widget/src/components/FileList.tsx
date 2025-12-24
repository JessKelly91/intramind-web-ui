/**
 * FileList Component
 * Displays list of files in upload queue
 */

import { h } from 'preact';
import type { UploadFile } from '../types';
import FileItem from './FileItem';

interface FileListProps {
  files: UploadFile[];
  onRemove: (index: number) => void;
  onRetry?: (index: number) => void;
}

export default function FileList({ files, onRemove, onRetry }: FileListProps) {
  if (files.length === 0) {
    return null;
  }

  const completedCount = files.filter(f => f.status === 'success').length;
  const errorCount = files.filter(f => f.status === 'error').length;
  const uploadingCount = files.filter(f => f.status === 'uploading').length;

  return (
    <div style={{ marginTop: '16px' }}>
      {/* Summary */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '8px 0',
        }}
      >
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
          Upload Queue ({files.length})
        </div>
        <div style={{ fontSize: '12px', color: '#666', display: 'flex', gap: '12px' }}>
          {uploadingCount > 0 && (
            <span style={{ color: '#3b82f6' }}>
              ⏳ {uploadingCount} uploading
            </span>
          )}
          {completedCount > 0 && (
            <span style={{ color: '#10b981' }}>
              ✅ {completedCount} complete
            </span>
          )}
          {errorCount > 0 && (
            <span style={{ color: '#ef4444' }}>
              ❌ {errorCount} failed
            </span>
          )}
        </div>
      </div>

      {/* File items */}
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {files.map((uploadFile, index) => (
          <FileItem
            key={`${uploadFile.file.name}-${index}`}
            uploadFile={uploadFile}
            onRemove={() => onRemove(index)}
            onRetry={onRetry ? () => onRetry(index) : undefined}
          />
        ))}
      </div>

      {/* Clear completed button */}
      {completedCount > 0 && (
        <button
          onClick={() => {
            // Remove all completed files (in reverse to maintain indices)
            for (let i = files.length - 1; i >= 0; i--) {
              if (files[i].status === 'success') {
                onRemove(i);
              }
            }
          }}
          style={{
            marginTop: '8px',
            fontSize: '12px',
            color: '#666',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '4px',
          }}
        >
          Clear completed files
        </button>
      )}
    </div>
  );
}
