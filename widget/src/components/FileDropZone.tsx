/**
 * FileDropZone Component
 * Drag & drop area for file upload
 */

import { h } from 'preact';
import { useState, useRef } from 'preact/hooks';

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  allowedTypes?: string[];
  maxFiles?: number;
}

export default function FileDropZone({
  onFilesSelected,
  disabled = false,
  allowedTypes,
  maxFiles,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length > 0) {
      const filesToUpload = maxFiles ? files.slice(0, maxFiles) : files;
      onFilesSelected(filesToUpload);
    }
  };

  const handleFileInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const files = Array.from(target.files || []);
    if (files.length > 0) {
      const filesToUpload = maxFiles ? files.slice(0, maxFiles) : files;
      onFilesSelected(filesToUpload);
    }
    // Reset input
    target.value = '';
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const accept = allowedTypes ? allowedTypes.join(',') : undefined;

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        backgroundColor: isDragging ? '#eff6ff' : '#fafafa',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={!maxFiles || maxFiles > 1}
        accept={accept}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      <div style={{ fontSize: '48px', marginBottom: '12px' }}>
        {isDragging ? '📥' : '📤'}
      </div>

      <div style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
        {isDragging ? 'Drop files here' : 'Drag & drop files here'}
      </div>

      <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
        or click to browse
      </div>

      <div style={{ fontSize: '12px', color: '#999' }}>
        Supported: PDF, DOCX, PPTX, TXT, MD, Images
        {maxFiles && ` (Max ${maxFiles} file${maxFiles > 1 ? 's' : ''})`}
      </div>
    </div>
  );
}
