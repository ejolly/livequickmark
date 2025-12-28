/**
 * Outliner Component
 *
 * Main outliner component that manages a page of blocks with keyboard navigation,
 * multi-select, zoom, and breadcrumb navigation
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { BlockTree } from './BlockTree';
import { Breadcrumb } from './Breadcrumb';
import { useBlockStore } from '../store';
import type { Block } from '../store';

export interface OutlinerProps {
  /** Page ID to display */
  pageId: string;

  /** Additional CSS classes */
  className?: string;
}

export const Outliner: React.FC<OutlinerProps> = ({ pageId, className = '' }) => {
  const blocks = useBlockStore((state) => state.blocks);
  const pages = useBlockStore((state) => state.pages);
  const focusedBlockId = useBlockStore((state) => state.focusedBlockId);
  const selectedBlockIds = useBlockStore((state) => state.selectedBlockIds);
  const zoomedBlockId = useBlockStore((state) => state.zoomedBlockId);

  const createBlock = useBlockStore((state) => state.createBlock);
  const updateBlock = useBlockStore((state) => state.updateBlock);
  const deleteBlock = useBlockStore((state) => state.deleteBlock);
  const indentBlock = useBlockStore((state) => state.indentBlock);
  const outdentBlock = useBlockStore((state) => state.outdentBlock);
  const toggleCollapse = useBlockStore((state) => state.toggleCollapse);
  const focusBlock = useBlockStore((state) => state.focusBlock);
  const selectBlocks = useBlockStore((state) => state.selectBlocks);
  const addToSelection = useBlockStore((state) => state.addToSelection);
  const clearSelection = useBlockStore((state) => state.clearSelection);
  const zoomToBlock = useBlockStore((state) => state.zoomToBlock);
  const getBlockPath = useBlockStore((state) => state.getBlockPath);
  const getChildren = useBlockStore((state) => state.getChildren);
  const getSiblings = useBlockStore((state) => state.getSiblings);

  // Get current page
  const currentPage = pages.get(pageId);

  // Get root blocks to display (either zoomed block's children or page's top-level blocks)
  const rootBlockIds = useMemo(() => {
    if (zoomedBlockId) {
      const children = getChildren(zoomedBlockId);
      return children.map((c) => c.id);
    }

    if (!currentPage) return [];

    // Get top-level blocks (blocks without parents)
    return currentPage.blockIds.filter((blockId) => {
      const block = blocks.get(blockId);
      return block && !block.parentId;
    });
  }, [zoomedBlockId, currentPage, blocks, getChildren]);

  // Get breadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!zoomedBlockId) return [];
    return getBlockPath(zoomedBlockId);
  }, [zoomedBlockId, getBlockPath]);

  // Get flat list of all visible blocks (for keyboard navigation)
  const getVisibleBlocks = useCallback((): Block[] => {
    const visible: Block[] = [];

    const traverse = (blockIds: string[]) => {
      for (const blockId of blockIds) {
        const block = blocks.get(blockId);
        if (!block) continue;

        visible.push(block);

        // Include children if not collapsed
        if (!block.collapsed) {
          const children = getChildren(blockId);
          traverse(children.map((c) => c.id));
        }
      }
    };

    traverse(rootBlockIds);
    return visible;
  }, [blocks, rootBlockIds, getChildren]);

  // Handle block content change
  const handleBlockChange = useCallback(
    async (blockId: string, content: string) => {
      await updateBlock(blockId, { content });
    },
    [updateBlock]
  );

  // Handle Enter key - create new block below
  const handleBlockEnter = useCallback(
    async (blockId: string, _e: React.KeyboardEvent) => {
      const block = blocks.get(blockId);
      if (!block) return;

      // Create new sibling block after current block
      const siblings = getSiblings(blockId);
      const currentIndex = siblings.findIndex((b) => b.id === blockId);
      const newOrder = currentIndex + 1;

      const newBlock = await createBlock({
        pageId: block.pageId,
        content: '',
        parentId: block.parentId,
        order: newOrder,
      });

      // Focus the new block
      focusBlock(newBlock.id);
    },
    [blocks, getSiblings, createBlock, focusBlock]
  );

  // Handle Backspace at empty block - delete block
  const handleBlockBackspace = useCallback(
    async (blockId: string, _e: React.KeyboardEvent) => {
      const block = blocks.get(blockId);
      if (!block || block.content.trim() !== '') return;

      const siblings = getSiblings(blockId);
      const currentIndex = siblings.findIndex((b) => b.id === blockId);

      // Focus previous sibling or parent
      if (currentIndex > 0) {
        focusBlock(siblings[currentIndex - 1].id);
      } else if (block.parentId) {
        focusBlock(block.parentId);
      }

      // Delete the block
      await deleteBlock(blockId);
    },
    [blocks, getSiblings, focusBlock, deleteBlock]
  );

  // Handle ArrowUp - move focus to previous visible block
  const handleBlockArrowUp = useCallback(
    (blockId: string, _e: React.KeyboardEvent) => {
      const visibleBlocks = getVisibleBlocks();
      const currentIndex = visibleBlocks.findIndex((b) => b.id === blockId);

      if (currentIndex > 0) {
        focusBlock(visibleBlocks[currentIndex - 1].id);
      }
    },
    [getVisibleBlocks, focusBlock]
  );

  // Handle ArrowDown - move focus to next visible block
  const handleBlockArrowDown = useCallback(
    (blockId: string, _e: React.KeyboardEvent) => {
      const visibleBlocks = getVisibleBlocks();
      const currentIndex = visibleBlocks.findIndex((b) => b.id === blockId);

      if (currentIndex < visibleBlocks.length - 1) {
        focusBlock(visibleBlocks[currentIndex + 1].id);
      }
    },
    [getVisibleBlocks, focusBlock]
  );

  // Handle Tab - indent block
  const handleBlockTab = useCallback(
    async (blockId: string, _e: React.KeyboardEvent) => {
      await indentBlock(blockId);
    },
    [indentBlock]
  );

  // Handle Shift+Tab - outdent block
  const handleBlockShiftTab = useCallback(
    async (blockId: string, _e: React.KeyboardEvent) => {
      await outdentBlock(blockId);
    },
    [outdentBlock]
  );

  // Handle bullet click - toggle collapse
  const handleBulletClick = useCallback(
    async (blockId: string) => {
      await toggleCollapse(blockId);
    },
    [toggleCollapse]
  );

  // Handle block click - focus and selection
  const handleBlockClick = useCallback(
    (blockId: string, e: React.MouseEvent) => {
      if (e.shiftKey) {
        // Shift+Click: Add to selection
        addToSelection(blockId);
      } else if (e.metaKey || e.ctrlKey) {
        // Cmd/Ctrl+Click: Toggle selection
        if (selectedBlockIds.has(blockId)) {
          const newSelection = new Set(selectedBlockIds);
          newSelection.delete(blockId);
          selectBlocks(Array.from(newSelection));
        } else {
          addToSelection(blockId);
        }
      } else {
        // Regular click: Focus and clear selection
        focusBlock(blockId);
        clearSelection();
      }
    },
    [addToSelection, selectedBlockIds, selectBlocks, focusBlock, clearSelection]
  );

  // Handle breadcrumb navigation
  const handleBreadcrumbNavigate = useCallback(
    (blockId: string | null) => {
      zoomToBlock(blockId);
    },
    [zoomToBlock]
  );

  // Create initial block if page is empty
  useEffect(() => {
    if (currentPage && rootBlockIds.length === 0) {
      createBlock({
        pageId: currentPage.id,
        content: '',
        parentId: zoomedBlockId,
        order: 0,
      }).then((newBlock) => {
        focusBlock(newBlock.id);
      });
    }
  }, [currentPage, rootBlockIds.length, createBlock, focusBlock, zoomedBlockId, pageId]);

  if (!currentPage) {
    return (
      <div className={`lqm-editor ${className}`}>
        <div style={{ padding: '20px', color: 'var(--lqm-text-muted)' }}>
          Page not found
        </div>
      </div>
    );
  }

  return (
    <div className={`lqm-editor ${className}`}>
      {/* Breadcrumb navigation when zoomed */}
      {zoomedBlockId && breadcrumbPath.length > 0 && (
        <Breadcrumb path={breadcrumbPath} onNavigate={handleBreadcrumbNavigate} />
      )}

      {/* Block tree */}
      <div style={{ padding: '20px' }}>
        <BlockTree
          blockIds={rootBlockIds}
          focusedBlockId={focusedBlockId}
          selectedBlockIds={selectedBlockIds}
          onBlockChange={handleBlockChange}
          onBlockEnter={handleBlockEnter}
          onBlockBackspace={handleBlockBackspace}
          onBlockArrowUp={handleBlockArrowUp}
          onBlockArrowDown={handleBlockArrowDown}
          onBlockTab={handleBlockTab}
          onBlockShiftTab={handleBlockShiftTab}
          onBulletClick={handleBulletClick}
          onBlockClick={handleBlockClick}
        />
      </div>
    </div>
  );
};

export default Outliner;
