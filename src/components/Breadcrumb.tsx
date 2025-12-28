/**
 * Breadcrumb Component
 *
 * Shows navigation path when zoomed into a block
 */

import React from 'react';
import type { Block } from '../store';

export interface BreadcrumbProps {
  /** Path of blocks from root to current zoomed block */
  path: Block[];

  /** Called when a breadcrumb item is clicked */
  onNavigate: (blockId: string | null) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ path, onNavigate }) => {
  if (path.length === 0) {
    return null;
  }

  const handleHomeClick = () => {
    onNavigate(null);
  };

  const handleItemClick = (blockId: string) => {
    onNavigate(blockId);
  };

  return (
    <div className="lqm-breadcrumb">
      {/* Home icon to zoom out to root */}
      <div className="lqm-breadcrumb-item" onClick={handleHomeClick} title="Zoom to root">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 6L8 2L14 6V13C14 13.5523 13.5523 14 13 14H3C2.44772 14 2 13.5523 2 13V6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Breadcrumb path */}
      {path.map((block, index) => {
        const isLast = index === path.length - 1;
        const truncatedContent =
          block.content.length > 50
            ? block.content.substring(0, 50) + '...'
            : block.content || 'Untitled';

        return (
          <React.Fragment key={block.id}>
            <div className="lqm-breadcrumb-separator">/</div>
            {isLast ? (
              <div className="lqm-breadcrumb-current">{truncatedContent}</div>
            ) : (
              <div
                className="lqm-breadcrumb-item"
                onClick={() => handleItemClick(block.id)}
                title={block.content}
              >
                {truncatedContent}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
