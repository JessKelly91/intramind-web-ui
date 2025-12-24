/**
 * DeleteConfirmationModal Component
 * Confirmation dialog for deleting collections
 */

import { h } from 'preact';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  collectionName: string;
  documentCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  collectionName,
  documentCount,
  onConfirm,
  onCancel,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

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
      onClick={onCancel}
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
        {/* Warning Icon */}
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
          }}
        >
          ⚠️
        </div>

        {/* Header */}
        <h3
          style={{
            margin: '0 0 12px 0',
            fontSize: '20px',
            fontWeight: 600,
            color: '#333',
            textAlign: 'center',
          }}
        >
          Delete Collection?
        </h3>

        {/* Message */}
        <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#666', textAlign: 'center' }}>
          Are you sure you want to delete the collection{' '}
          <strong style={{ color: '#333' }}>"{collectionName}"</strong>?
        </p>

        {/* Warning */}
        <div
          style={{
            padding: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#991b1b', marginBottom: '8px', fontWeight: 600 }}>
            ⚠️ Warning: This action cannot be undone
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#991b1b' }}>
            <li>All {documentCount} document{documentCount !== 1 ? 's' : ''} will be deleted</li>
            <li>Vector embeddings will be removed</li>
            <li>This collection cannot be recovered</li>
          </ul>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 20px',
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
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px 20px',
              fontSize: '14px',
              fontWeight: 600,
              color: 'white',
              backgroundColor: '#ef4444',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444';
            }}
          >
            Delete Collection
          </button>
        </div>

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
