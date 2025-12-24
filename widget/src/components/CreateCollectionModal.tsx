/**
 * CreateCollectionModal Component
 * Modal for creating a new collection
 */

import { h } from 'preact';
import { useState } from 'preact/hooks';

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string) => void;
  primaryColor: string;
}

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreate,
  primaryColor,
}: CreateCollectionModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: Event) => {
    e.preventDefault();

    // Validate name
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Collection name is required');
      return;
    }

    if (trimmedName.length < 3) {
      setError('Collection name must be at least 3 characters');
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
      setError('Collection name can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    // Call onCreate
    onCreate(trimmedName, description.trim() || undefined);

    // Reset form
    setName('');
    setDescription('');
    setError('');
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '90%',
          maxWidth: '400px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          animation: 'slideIn 0.3s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#333' }}>
            Create New Collection
          </h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
            Collections organize your documents by topic or category
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name input */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '8px',
              }}
            >
              Collection Name *
            </label>
            <input
              type="text"
              value={name}
              onInput={(e) => {
                setName((e.target as HTMLInputElement).value);
                setError('');
              }}
              placeholder="e.g., company-policies"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                if (!error) {
                  (e.target as HTMLInputElement).style.borderColor = primaryColor;
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  (e.target as HTMLInputElement).style.borderColor = '#d1d5db';
                }
              }}
              autoFocus
            />
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Use letters, numbers, hyphens, and underscores only
            </div>
          </div>

          {/* Description input */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                color: '#333',
                marginBottom: '8px',
              }}
            >
              Description (optional)
            </label>
            <textarea
              value={description}
              onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
              placeholder="Brief description of this collection..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                (e.target as HTMLTextAreaElement).style.borderColor = primaryColor;
              }}
              onBlur={(e) => {
                (e.target as HTMLTextAreaElement).style.borderColor = '#d1d5db';
              }}
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                marginBottom: '16px',
              }}
            >
              <div style={{ fontSize: '13px', color: '#ef4444' }}>{error}</div>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#666',
                backgroundColor: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'white';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'white',
                backgroundColor: !name.trim() ? '#d1d5db' : primaryColor,
                border: 'none',
                borderRadius: '8px',
                cursor: !name.trim() ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                if (name.trim()) {
                  (e.target as HTMLButtonElement).style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.opacity = '1';
              }}
            >
              Create Collection
            </button>
          </div>
        </form>

        {/* Keyframe animations */}
        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}
        </style>
      </div>
    </div>
  );
}
