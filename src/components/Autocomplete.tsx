/**
 * Autocomplete dropdown component for wiki-links, block references, and tags
 */

import { useEffect, useRef } from 'react';

export interface AutocompleteItem {
  id: string;
  title: string;
  type: 'page' | 'block' | 'tag';
}

export interface AutocompleteProps {
  items: AutocompleteItem[];
  selectedIndex: number;
  onSelect: (item: AutocompleteItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
  type: 'page' | 'block' | 'tag';
  query?: string;
}

/**
 * Icon component for different item types
 */
const ItemIcon = ({ type }: { type: 'page' | 'block' | 'tag' }) => {
  switch (type) {
    case 'page':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
      );
    case 'block':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case 'tag':
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 8l6-6h6v6l-6 6-6-6z"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="11" cy="5" r="1" fill="currentColor" />
        </svg>
      );
  }
};

/**
 * Highlight matching text in the title
 */
const HighlightedTitle = ({ title, query }: { title: string; query?: string }) => {
  if (!query || !query.trim()) {
    return <span>{title}</span>;
  }

  const lowerTitle = title.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerTitle.indexOf(lowerQuery);

  if (index === -1) {
    return <span>{title}</span>;
  }

  const before = title.slice(0, index);
  const match = title.slice(index, index + query.length);
  const after = title.slice(index + query.length);

  return (
    <span>
      {before}
      <mark style={{ backgroundColor: '#ffd700', color: 'inherit', fontWeight: 'bold' }}>
        {match}
      </mark>
      {after}
    </span>
  );
};

/**
 * Autocomplete dropdown component
 */
export const Autocomplete = ({
  items,
  selectedIndex,
  onSelect,
  onClose,
  position,
  type,
  query,
}: AutocompleteProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedItemRef.current) {
      selectedItemRef.current.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [selectedIndex]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Determine if we should show "Create new" option
  const hasExactMatch = items.some(
    (item) => item.title.toLowerCase() === query?.toLowerCase()
  );
  const shouldShowCreate = query && query.trim() && !hasExactMatch;

  // Combine items with "Create new" option
  const displayItems = [...items];
  if (shouldShowCreate) {
    const createLabel = type === 'page' ? 'page' : type === 'block' ? 'block' : 'tag';
    displayItems.push({
      id: '__create__',
      title: `Create new ${createLabel}: "${query}"`,
      type,
    });
  }

  // Handle item selection
  const handleItemClick = (item: AutocompleteItem, _index: number) => {
    if (item.id === '__create__') {
      // Create new item with the query as title
      onSelect({
        id: '__create__',
        title: query || '',
        type,
      });
    } else {
      onSelect(item);
    }
  };

  return (
    <div
      ref={containerRef}
      className="lqm-autocomplete"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        maxHeight: '300px',
        overflowY: 'auto',
        minWidth: '200px',
        maxWidth: '400px',
      }}
    >
      {displayItems.length === 0 ? (
        <div
          className="lqm-autocomplete-item"
          style={{
            padding: '8px 12px',
            color: '#999',
            fontStyle: 'italic',
          }}
        >
          No results found
        </div>
      ) : (
        displayItems.map((item, index) => (
          <div
            key={item.id}
            ref={index === selectedIndex ? selectedItemRef : null}
            className={`lqm-autocomplete-item${index === selectedIndex ? ' selected' : ''}`}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: index === selectedIndex ? '#f0f0f0' : 'transparent',
              borderBottom: index < displayItems.length - 1 ? '1px solid #eee' : 'none',
            }}
            onClick={() => handleItemClick(item, index)}
            onMouseEnter={() => {
              // Update selected index on hover - visual feedback only
            }}
          >
            {item.id !== '__create__' && <ItemIcon type={item.type} />}
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.id === '__create__' ? (
                item.title
              ) : (
                <HighlightedTitle title={item.title} query={query} />
              )}
            </span>
          </div>
        ))
      )}
    </div>
  );
};
