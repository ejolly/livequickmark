/**
 * BlockTree Component
 *
 * Recursively renders a tree of blocks
 */

import React from 'react';
import { Block } from './Block';
import { useBlockStore } from '../store';

export interface BlockTreeProps {
  /** Root block IDs to render */
  blockIds: string[];

  /** Current depth level */
  depth?: number;

  /** Focused block ID */
  focusedBlockId?: string | null;

  /** Selected block IDs */
  selectedBlockIds?: Set<string>;

  /** Called when block content changes */
  onBlockChange?: (blockId: string, content: string) => void;

  /** Called when Enter is pressed */
  onBlockEnter?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when Backspace is pressed at empty block */
  onBlockBackspace?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when ArrowUp is pressed */
  onBlockArrowUp?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when ArrowDown is pressed */
  onBlockArrowDown?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when Tab is pressed (indent) */
  onBlockTab?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when Shift+Tab is pressed (outdent) */
  onBlockShiftTab?: (blockId: string, e: React.KeyboardEvent) => void;

  /** Called when bullet is clicked */
  onBulletClick?: (blockId: string) => void;

  /** Called when block is clicked */
  onBlockClick?: (blockId: string, e: React.MouseEvent) => void;
}

export const BlockTree: React.FC<BlockTreeProps> = ({
  blockIds,
  depth = 0,
  focusedBlockId = null,
  selectedBlockIds = new Set(),
  onBlockChange,
  onBlockEnter,
  onBlockBackspace,
  onBlockArrowUp,
  onBlockArrowDown,
  onBlockTab,
  onBlockShiftTab,
  onBulletClick,
  onBlockClick,
}) => {
  const blocks = useBlockStore((state) => state.blocks);
  const getChildren = useBlockStore((state) => state.getChildren);

  if (blockIds.length === 0) {
    return null;
  }

  return (
    <>
      {blockIds.map((blockId) => {
        const block = blocks.get(blockId);
        if (!block) return null;

        const children = getChildren(blockId);
        const hasChildren = children.length > 0;
        const isFocused = focusedBlockId === blockId;
        const isSelected = selectedBlockIds.has(blockId);

        return (
          <Block
            key={blockId}
            block={block}
            hasChildren={hasChildren}
            focused={isFocused}
            selected={isSelected}
            depth={depth}
            onChange={onBlockChange}
            onEnter={onBlockEnter}
            onBackspace={onBlockBackspace}
            onArrowUp={onBlockArrowUp}
            onArrowDown={onBlockArrowDown}
            onTab={onBlockTab}
            onShiftTab={onBlockShiftTab}
            onBulletClick={onBulletClick}
            onClick={onBlockClick}
          >
            {/* Recursively render children */}
            {hasChildren && !block.collapsed && (
              <BlockTree
                blockIds={children.map((c) => c.id)}
                depth={depth + 1}
                focusedBlockId={focusedBlockId}
                selectedBlockIds={selectedBlockIds}
                onBlockChange={onBlockChange}
                onBlockEnter={onBlockEnter}
                onBlockBackspace={onBlockBackspace}
                onBlockArrowUp={onBlockArrowUp}
                onBlockArrowDown={onBlockArrowDown}
                onBlockTab={onBlockTab}
                onBlockShiftTab={onBlockShiftTab}
                onBulletClick={onBulletClick}
                onBlockClick={onBlockClick}
              />
            )}
          </Block>
        );
      })}
    </>
  );
};
