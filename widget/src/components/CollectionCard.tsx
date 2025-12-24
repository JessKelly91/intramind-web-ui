/**
 * CollectionCard Component
 * Displays individual collection with stats and actions
 */

import { h } from 'preact';
import type { Collection } from '../types';

interface CollectionCardProps {
  collection: Collection;
  onDelete: () => void;
  onSelect?: () => void;
  primaryColor: string;
  isSelected?: boolean;
}

export default function CollectionCard({
  collection,
  onDelete,
  onSelect,
  primaryColor,
  isSelected = false,
}: CollectionCardProps) {
  const formattedDate = new Date(collection.createdAt).toLocaleDateString();

  return (
    <div
      onClick={onSelect}
      style={{
        padding: '16px',
        backgroundColor: isSelected ? '#f0f9ff' : 'white',
        border: `2px solid ${isSelected ? primaryColor : '#e5e7eb'}`,
        borderRadius: '12px',
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (onSelect && !isSelected) {
          (e.currentTarget as HTMLElement).style.borderColor = primaryColor;
          (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
        }
      }}
      onMouseLeave={(e) => {
        if (onSelect && !isSelected) {
          (e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb';
          (e.currentTarget as HTMLElement).style.backgroundColor = 'white';
        }
      }}
    >
      {/* Collection Icon and Name */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px' }}>
        <div style={{ fontSize: '32px' }}>📁</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#333',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {collection.name}
          </h4>
          {collection.description && (
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '13px',
                color: '#666',
                lineHeight: '1.4',
              }}
            >
              {collection.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '12px',
          fontSize: '13px',
          color: '#666',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>📄</span>
          <span>
            {collection.documentCount} {collection.documentCount === 1 ? 'document' : 'documents'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>📅</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {onSelect && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              fontSize: '13px',
              fontWeight: 600,
              color: primaryColor,
              backgroundColor: 'white',
              border: `1px solid ${primaryColor}`,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = primaryColor;
              (e.target as HTMLButtonElement).style.color = 'white';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'white';
              (e.target as HTMLButtonElement).style.color = primaryColor;
            }}
          >
            View Details
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 600,
            color: '#ef4444',
            backgroundColor: 'white',
            border: '1px solid #ef4444',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444';
            (e.target as HTMLButtonElement).style.color = 'white';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.backgroundColor = 'white';
            (e.target as HTMLButtonElement).style.color = '#ef4444';
          }}
        >
          Delete
        </button>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '20px',
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}
