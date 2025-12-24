/**
 * CollectionsTab Component
 * Main interface for viewing and managing collections
 */

import { h } from 'preact';
import { useState } from 'preact/hooks';
import type { Collection } from '../types';
import CollectionCard from './CollectionCard';
import CreateCollectionModal from './CreateCollectionModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface CollectionsTabProps {
  collections: Collection[];
  onCreateCollection: (name: string, description?: string) => void;
  onDeleteCollection: (name: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  primaryColor: string;
}

export default function CollectionsTab({
  collections,
  onCreateCollection,
  onDeleteCollection,
  onRefresh,
  isLoading,
  primaryColor,
}: CollectionsTabProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  const handleCreate = (name: string, description?: string) => {
    onCreateCollection(name, description);
    setShowCreateModal(false);
  };

  const handleDelete = () => {
    if (deleteTarget) {
      onDeleteCollection(deleteTarget.name);
      setDeleteTarget(null);
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#333' }}>
            Collections
          </h3>
          <button
            onClick={onRefresh}
            disabled={isLoading}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#666',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: isLoading ? 'wait' : 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = '#f3f4f6';
              }
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'white';
            }}
          >
            {isLoading ? '⏳' : '🔄'} Refresh
          </button>
        </div>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
          Manage your document collections
        </p>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Create button */}
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'white',
            backgroundColor: primaryColor,
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.opacity = '1';
          }}
        >
          <span style={{ fontSize: '18px' }}>+</span>
          <span>Create New Collection</span>
        </button>

        {/* Loading state */}
        {isLoading && collections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⏳</div>
            <div style={{ fontSize: '14px' }}>Loading collections...</div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && collections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📂</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#333', marginBottom: '8px' }}>
              No Collections Yet
            </div>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              Create your first collection to organize documents
            </div>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e40af', marginBottom: '6px' }}>
                💡 What are collections?
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12px', color: '#1e3a8a' }}>
                <li style={{ marginBottom: '4px' }}>Group related documents together</li>
                <li style={{ marginBottom: '4px' }}>Search within specific topics</li>
                <li style={{ marginBottom: '4px' }}>Organize by department, project, or category</li>
                <li>Keep your knowledge base structured</li>
              </ul>
            </div>
          </div>
        )}

        {/* Collection grid */}
        {collections.length > 0 && (
          <div style={{ display: 'grid', gap: '12px' }}>
            {collections.map((collection) => (
              <CollectionCard
                key={collection.name}
                collection={collection}
                onDelete={() => setDeleteTarget(collection)}
                primaryColor={primaryColor}
              />
            ))}
          </div>
        )}

        {/* Collection stats */}
        {collections.length > 0 && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666',
            }}
          >
            <strong style={{ color: '#333' }}>Summary:</strong> {collections.length} collection
            {collections.length !== 1 ? 's' : ''} •{' '}
            {collections.reduce((sum, c) => sum + c.documentCount, 0)} total documents
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        primaryColor={primaryColor}
      />

      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        collectionName={deleteTarget?.name || ''}
        documentCount={deleteTarget?.documentCount || 0}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
