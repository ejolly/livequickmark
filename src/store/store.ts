/**
 * Main Zustand store with immer middleware for immutable updates
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import type { Block, Page, Store } from './types';
import { createMemoryAdapter } from './memory-adapter';

/**
 * Create the block store with Zustand + immer
 */
export const useBlockStore = create<Store>()(
  immer((set, get) => ({
    // Initial state
    blocks: new Map(),
    pages: new Map(),
    currentPageId: null,
    zoomedBlockId: null,
    focusedBlockId: null,
    selectedBlockIds: new Set(),
    adapter: createMemoryAdapter(),

    // Block CRUD operations

    createBlock: async (blockData) => {
      const now = Date.now();
      const block: Block = {
        id: nanoid(),
        content: blockData.content,
        pageId: blockData.pageId,
        parentId: blockData.parentId || null,
        childrenIds: blockData.childrenIds || [],
        order: blockData.order ?? 0,
        collapsed: blockData.collapsed ?? false,
        properties: blockData.properties || {},
        createdAt: blockData.createdAt ?? now,
        updatedAt: now,
      };

      const { adapter } = get();
      await adapter.saveBlock(block);

      set((state) => {
        state.blocks.set(block.id, block);

        // Update parent's childrenIds if this block has a parent
        if (block.parentId) {
          const parent = state.blocks.get(block.parentId);
          if (parent && !parent.childrenIds.includes(block.id)) {
            parent.childrenIds.push(block.id);
            parent.updatedAt = now;
          }
        }

        // Update page's blockIds
        const page = state.pages.get(block.pageId);
        if (page && !page.blockIds.includes(block.id)) {
          page.blockIds.push(block.id);
          page.updatedAt = now;
        }
      });

      return block;
    },

    updateBlock: async (id, updates) => {
      const { adapter } = get();
      const block = get().blocks.get(id);
      if (!block) return;

      const updatedBlock: Block = {
        ...block,
        ...updates,
        id, // Ensure ID can't be changed
        updatedAt: Date.now(),
      };

      await adapter.saveBlock(updatedBlock);

      set((state) => {
        state.blocks.set(id, updatedBlock);
      });
    },

    deleteBlock: async (id) => {
      const { adapter } = get();
      const block = get().blocks.get(id);
      if (!block) return;

      // Recursively delete all children
      const children = get().getChildren(id);
      for (const child of children) {
        await get().deleteBlock(child.id);
      }

      await adapter.deleteBlock(id);

      set((state) => {
        // Remove from blocks map
        state.blocks.delete(id);

        // Remove from parent's childrenIds
        if (block.parentId) {
          const parent = state.blocks.get(block.parentId);
          if (parent) {
            parent.childrenIds = parent.childrenIds.filter((cid) => cid !== id);
            parent.updatedAt = Date.now();
          }
        }

        // Remove from page's blockIds
        const page = state.pages.get(block.pageId);
        if (page) {
          page.blockIds = page.blockIds.filter((bid) => bid !== id);
          page.updatedAt = Date.now();
        }

        // Clear UI state if this block was selected/focused
        if (state.focusedBlockId === id) {
          state.focusedBlockId = null;
        }
        if (state.zoomedBlockId === id) {
          state.zoomedBlockId = null;
        }
        state.selectedBlockIds.delete(id);
      });
    },

    // Block tree operations

    moveBlock: async (blockId, newParentId, newOrder) => {
      const block = get().blocks.get(blockId);
      if (!block) return;

      const oldParentId = block.parentId;
      const { adapter } = get();

      set((state) => {
        const block = state.blocks.get(blockId);
        if (!block) return;

        // Remove from old parent
        if (oldParentId) {
          const oldParent = state.blocks.get(oldParentId);
          if (oldParent) {
            oldParent.childrenIds = oldParent.childrenIds.filter((id) => id !== blockId);
            oldParent.updatedAt = Date.now();
          }
        }

        // Add to new parent
        if (newParentId) {
          const newParent = state.blocks.get(newParentId);
          if (newParent && !newParent.childrenIds.includes(blockId)) {
            newParent.childrenIds.splice(newOrder, 0, blockId);
            newParent.updatedAt = Date.now();
          }
        }

        // Update block
        block.parentId = newParentId;
        block.order = newOrder;
        block.updatedAt = Date.now();
      });

      const updatedBlock = get().blocks.get(blockId);
      if (updatedBlock) {
        await adapter.saveBlock(updatedBlock);
      }
    },

    indentBlock: async (blockId) => {
      const siblings = get().getSiblings(blockId);
      const block = get().blocks.get(blockId);
      if (!block || siblings.length === 0) return;

      const currentIndex = siblings.findIndex((b) => b.id === blockId);
      if (currentIndex === 0) return; // Can't indent first sibling

      const newParent = siblings[currentIndex - 1];
      await get().moveBlock(blockId, newParent.id, newParent.childrenIds.length);
    },

    outdentBlock: async (blockId) => {
      const block = get().blocks.get(blockId);
      if (!block || !block.parentId) return;

      const parent = get().blocks.get(block.parentId);
      if (!parent) return;

      const grandparentId = parent.parentId;
      const parentSiblings = get().getSiblings(parent.id);
      const newOrder = parentSiblings.findIndex((b) => b.id === parent.id) + 1;

      await get().moveBlock(blockId, grandparentId, newOrder);
    },

    toggleCollapse: async (blockId) => {
      const block = get().blocks.get(blockId);
      if (!block) return;

      await get().updateBlock(blockId, { collapsed: !block.collapsed });
    },

    // Page CRUD operations

    createPage: async (name, properties = {}) => {
      const now = Date.now();
      const page: Page = {
        id: nanoid(),
        name,
        blockIds: [],
        properties,
        createdAt: now,
        updatedAt: now,
      };

      const { adapter } = get();
      await adapter.savePage(page);

      set((state) => {
        state.pages.set(page.id, page);
      });

      return page;
    },

    updatePage: async (id, updates) => {
      const { adapter } = get();
      const page = get().pages.get(id);
      if (!page) return;

      const updatedPage: Page = {
        ...page,
        ...updates,
        id, // Ensure ID can't be changed
        updatedAt: Date.now(),
      };

      await adapter.savePage(updatedPage);

      set((state) => {
        state.pages.set(id, updatedPage);
      });
    },

    deletePage: async (id) => {
      const { adapter } = get();
      const page = get().pages.get(id);
      if (!page) return;

      // Delete all blocks on this page
      const blockIds = [...page.blockIds];
      for (const blockId of blockIds) {
        await get().deleteBlock(blockId);
      }

      await adapter.deletePage(id);

      set((state) => {
        state.pages.delete(id);

        // Clear UI state if this page was current
        if (state.currentPageId === id) {
          state.currentPageId = null;
        }
      });
    },

    // Navigation actions

    setCurrentPage: (pageId) => {
      set((state) => {
        state.currentPageId = pageId;
      });
    },

    zoomToBlock: (blockId) => {
      set((state) => {
        state.zoomedBlockId = blockId;
      });
    },

    focusBlock: (blockId) => {
      set((state) => {
        state.focusedBlockId = blockId;
      });
    },

    selectBlocks: (blockIds) => {
      set((state) => {
        state.selectedBlockIds = new Set(blockIds);
      });
    },

    addToSelection: (blockId) => {
      set((state) => {
        state.selectedBlockIds.add(blockId);
      });
    },

    removeFromSelection: (blockId) => {
      set((state) => {
        state.selectedBlockIds.delete(blockId);
      });
    },

    clearSelection: () => {
      set((state) => {
        state.selectedBlockIds.clear();
      });
    },

    // Query methods (synchronous, read from store state)

    getBlock: (id) => {
      return get().blocks.get(id) || null;
    },

    getPage: (id) => {
      return get().pages.get(id) || null;
    },

    getPageBlocks: (pageId) => {
      const blocks = Array.from(get().blocks.values()).filter(
        (block) => block.pageId === pageId
      );
      return blocks.sort((a, b) => a.order - b.order);
    },

    getChildren: (blockId) => {
      const block = get().blocks.get(blockId);
      if (!block) return [];

      return block.childrenIds
        .map((id) => get().blocks.get(id))
        .filter((b): b is Block => b !== undefined)
        .sort((a, b) => a.order - b.order);
    },

    getParent: (blockId) => {
      const block = get().blocks.get(blockId);
      if (!block || !block.parentId) return null;

      return get().blocks.get(block.parentId) || null;
    },

    getSiblings: (blockId) => {
      const block = get().blocks.get(blockId);
      if (!block) return [];

      if (block.parentId) {
        return get().getChildren(block.parentId);
      } else {
        // Root-level blocks on the same page
        return get()
          .getPageBlocks(block.pageId)
          .filter((b) => !b.parentId);
      }
    },

    getBlockPath: (blockId) => {
      const path: Block[] = [];
      let currentId: string | null = blockId;

      while (currentId) {
        const block = get().blocks.get(currentId);
        if (!block) break;

        path.unshift(block);
        currentId = block.parentId;
      }

      return path;
    },

    // Data loading

    loadPage: async (pageId) => {
      const { adapter } = get();

      const page = await adapter.getPage(pageId);
      if (!page) return;

      const blocks = await adapter.getPageBlocks(pageId);

      set((state) => {
        state.pages.set(page.id, page);
        for (const block of blocks) {
          state.blocks.set(block.id, block);
        }
      });
    },

    loadAllPages: async () => {
      const { adapter } = get();

      const pages = await adapter.getAllPages();

      set((state) => {
        for (const page of pages) {
          state.pages.set(page.id, page);
        }
      });

      // Load all blocks for all pages
      for (const page of pages) {
        const blocks = await adapter.getPageBlocks(page.id);
        set((state) => {
          for (const block of blocks) {
            state.blocks.set(block.id, block);
          }
        });
      }
    },

    setAdapter: (adapter) => {
      set((state) => {
        state.adapter = adapter;
      });
    },
  }))
);

/**
 * Selectors for common queries
 */
export const selectCurrentPage = (state: Store) =>
  state.currentPageId ? state.pages.get(state.currentPageId) : null;

export const selectCurrentPageBlocks = (state: Store) =>
  state.currentPageId ? state.getPageBlocks(state.currentPageId) : [];

export const selectZoomedBlock = (state: Store) =>
  state.zoomedBlockId ? state.blocks.get(state.zoomedBlockId) : null;

export const selectFocusedBlock = (state: Store) =>
  state.focusedBlockId ? state.blocks.get(state.focusedBlockId) : null;

export const selectSelectedBlocks = (state: Store) =>
  Array.from(state.selectedBlockIds)
    .map((id) => state.blocks.get(id))
    .filter((b): b is Block => b !== undefined);
