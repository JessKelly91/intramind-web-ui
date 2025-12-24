/**
 * UploadTab Component
 * Main upload interface with file selection and upload controls
 */

import { h } from 'preact';
import type { UploadFile, Collection } from '../types';
import FileDropZone from './FileDropZone';
import FileList from './FileList';
import CollectionSelector from './CollectionSelector';

interface UploadTabProps {
  uploadFiles: UploadFile[];
  collections: Collection[];
  selectedCollection: string;
  onFilesSelected: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onRetryFile: (index: number) => void;
  onCollectionSelect: (collection: string) => void;
  onStartUpload: () => void;
  isUploading: boolean;
  primaryColor: string;
}

export default function UploadTab({
  uploadFiles,
  collections,
  selectedCollection,
  onFilesSelected,
  onRemoveFile,
  onRetryFile,
  onCollectionSelect,
  onStartUpload,
  isUploading,
  primaryColor,
}: UploadTabProps) {
  const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
  const hasFilesToUpload = pendingFiles.length > 0;
  const uploadingCount = uploadFiles.filter(f => f.status === 'uploading').length;

  return (
    <div
      style={{
        padding: '16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>
          Upload Documents
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#666' }}>
          Add documents to your knowledge base
        </p>
      </div>

      {/* File Drop Zone */}
      <FileDropZone
        onFilesSelected={onFilesSelected}
        disabled={isUploading}
        maxFiles={10}
      />

      {/* Collection Selector */}
      <CollectionSelector
        collections={collections}
        selectedCollection={selectedCollection}
        onSelect={onCollectionSelect}
        disabled={isUploading}
        primaryColor={primaryColor}
      />

      {/* File List */}
      <FileList
        files={uploadFiles}
        onRemove={onRemoveFile}
        onRetry={onRetryFile}
      />

      {/* Upload Button */}
      {hasFilesToUpload && (
        <button
          onClick={onStartUpload}
          disabled={isUploading || !selectedCollection || collections.length === 0}
          style={{
            marginTop: '16px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
            backgroundColor:
              isUploading || !selectedCollection || collections.length === 0
                ? '#d1d5db'
                : primaryColor,
            border: 'none',
            borderRadius: '8px',
            cursor:
              isUploading || !selectedCollection || collections.length === 0
                ? 'not-allowed'
                : 'pointer',
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
          onMouseEnter={(e) => {
            if (!isUploading && selectedCollection && collections.length > 0) {
              (e.target as HTMLButtonElement).style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.opacity = '1';
          }}
        >
          {isUploading ? (
            <>
              <span>⏳</span>
              <span>Uploading {uploadingCount} file{uploadingCount > 1 ? 's' : ''}...</span>
            </>
          ) : (
            <>
              <span>📤</span>
              <span>Upload {pendingFiles.length} file{pendingFiles.length > 1 ? 's' : ''}</span>
            </>
          )}
        </button>
      )}

      {/* Empty state */}
      {uploadFiles.length === 0 && (
        <div
          style={{
            marginTop: '32px',
            textAlign: 'center',
            color: '#999',
            fontSize: '14px',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
          <div>No files selected</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Drag and drop files above to get started
          </div>
        </div>
      )}

      {/* Instructions */}
      {uploadFiles.length === 0 && (
        <div
          style={{
            marginTop: '24px',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
          }}
        >
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af', marginBottom: '6px' }}>
            💡 Tips:
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#1e3a8a' }}>
            <li style={{ marginBottom: '4px' }}>Supported formats: PDF, DOCX, PPTX, TXT, MD, Images</li>
            <li style={{ marginBottom: '4px' }}>Maximum file size: 10MB per file</li>
            <li style={{ marginBottom: '4px' }}>You can upload up to 10 files at once</li>
            <li>Files are automatically processed and indexed</li>
          </ul>
        </div>
      )}
    </div>
  );
}
