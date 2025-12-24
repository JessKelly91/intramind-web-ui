/**
 * CollectionSelector Component
 * Dropdown to select target collection for uploads
 */

import { h } from 'preact';
import type { Collection } from '../types';

interface CollectionSelectorProps {
  collections: Collection[];
  selectedCollection: string;
  onSelect: (collection: string) => void;
  disabled?: boolean;
  primaryColor: string;
}

export default function CollectionSelector({
  collections,
  selectedCollection,
  onSelect,
  disabled = false,
  primaryColor,
}: CollectionSelectorProps) {
  return (
    <div style={{ marginTop: '16px' }}>
      <label
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: 600,
          color: '#333',
          marginBottom: '8px',
        }}
      >
        Target Collection
      </label>

      <select
        value={selectedCollection}
        onChange={(e) => onSelect((e.target as HTMLSelectElement).value)}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          backgroundColor: disabled ? '#f3f4f6' : 'white',
          color: disabled ? '#9ca3af' : '#333',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={(e) => {
          if (!disabled) {
            (e.target as HTMLSelectElement).style.borderColor = primaryColor;
          }
        }}
        onBlur={(e) => {
          (e.target as HTMLSelectElement).style.borderColor = '#d1d5db';
        }}
      >
        {collections.length === 0 ? (
          <option value="">No collections available</option>
        ) : (
          collections.map((collection) => (
            <option key={collection.name} value={collection.name}>
              {collection.name} ({collection.documentCount} docs)
            </option>
          ))
        )}
      </select>

      {collections.length === 0 && (
        <div
          style={{
            fontSize: '12px',
            color: '#ef4444',
            marginTop: '4px',
          }}
        >
          No collections found. Create one first or check your connection.
        </div>
      )}
    </div>
  );
}
