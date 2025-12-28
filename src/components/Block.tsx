/**
 * Block Component
 *
 * Renders a single block with bullet point, content editor, and collapse functionality
 */

import React from 'react';
import { BlockEditor } from '../editor';
import type { Block as BlockType } from '../store';

export interface BlockProps {
  /** Block data */
  block: BlockType;

  /** Whether this block has children */
  hasChildren: boolean;

  /** Whether this block is focused */
  focused?: boolean;

  /** Whether this block is selected */
  selected?: boolean;

  /** Depth level (for visual indent) */
  depth?: number;

  /** Called when block content changes */
  onChange?: (blockId: string, content: string) => void;

  /** Called when Enter is pressed */
  onEnter?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when Backspace is pressed at empty block */
  onBackspace?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when ArrowUp is pressed */
  onArrowUp?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when ArrowDown is pressed */
  onArrowDown?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when Tab is pressed (indent) */
  onTab?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when Shift+Tab is pressed (outdent) */
  onShiftTab?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when bullet is clicked */
  onBulletClick?: (blockId: string) => void;

  /** Called when block is clicked */
  onClick?: (blockId: string, e: React.MouseEvent) => void;

  /** Children blocks (rendered by parent) */
  children?: React.ReactNode;
}

export const Block: React.FC<BlockProps> = ({
  block,
  hasChildren,
  focused = false,
  selected = false,
  depth: _depth = 0,
  onChange,
  onEnter,
  onBackspace,
  onArrowUp: _onArrowUp,
  onArrowDown: _onArrowDown,
  onTab,
  onShiftTab,
  onBulletClick,
  onClick,
  children,
}) => {
  const handleBulletClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onBulletClick?.(block.id);
  };

  const handleBlockClick = (e: React.MouseEvent) => {
    onClick?.(block.id, e);
  };

  const handleChange = (content: string) => {
    onChange?.(block.id, content);
  };

  const handleEnter = (_cursorPosition: number) => {
    onEnter?.(block.id, {} as React.KeyboardEvent);
  };

  const handleBackspace = () => {
    onBackspace?.(block.id, {} as React.KeyboardEvent);
  };

  const handleIndent = () => {
    onTab?.(block.id, {} as React.KeyboardEvent);
  };

  const handleOutdent = () => {
    onShiftTab?.(block.id, {} as React.KeyboardEvent);
  };

  // Determine bullet style
  const bulletClasses = [
    'lqm-block-bullet',
    hasChildren && 'has-children',
    block.collapsed && 'folded',
  ]
    .filter(Boolean)
    .join(' ');

  // Determine block classes
  const blockClasses = [
    'lqm-block',
    focused && 'focused',
    selected && 'selected',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={blockClasses} onClick={handleBlockClick}>
      <div className="lqm-block-content">
        {/* Bullet point */}
        <div
          className={bulletClasses}
          onClick={handleBulletClick}
          data-drag-handle
          title={hasChildren ? (block.collapsed ? 'Expand' : 'Collapse') : ''}
        />

        {/* Block editor */}
        <BlockEditor
          content={block.content}
          onChange={handleChange}
          onEnter={handleEnter}
          onBackspace={handleBackspace}
          onIndent={handleIndent}
          onOutdent={handleOutdent}
          autoFocus={focused}
          placeholder="Type here..."
        />
      </div>

      {/* Children blocks */}
      {hasChildren && !block.collapsed && (
        <div className="lqm-block-children">{children}</div>
      )}
    </div>
  );
};
