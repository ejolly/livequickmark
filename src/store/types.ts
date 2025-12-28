/**
 * Core types for the block store
 */

export interface Block {
  id: string;
  content: string;
  pageId: string;
  parentId: string | null;
  childrenIds: string[];
  order: number;
  collapsed: boolean;
  properties?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

export interface Page {
  id: string;
  name: string;
  blockIds: string[];
  properties?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Storage adapter interface - allows swapping storage backends
 * (in-memory, IndexedDB, DuckDB, etc.)
 */
export interface StorageAdapter {
  // Block operations
  getBlock(id: string): Promise<Block | null>;
  saveBlock(block: Block): Promise<void>;
  deleteBlock(id: string): Promise<void>;

  // Page operations
  getPage(id: string): Promise<Page | null>;
  getAllPages(): Promise<Page[]>;
  savePage(page: Page): Promise<void>;
  deletePage(id: string): Promise<void>;

  // Batch operations for performance
  getBlocks(ids: string[]): Promise<Map<string, Block>>;
  saveBlocks(blocks: Block[]): Promise<void>;

  // Query operations
  getPageBlocks(pageId: string): Promise<Block[]>;
  getChildBlocks(parentId: string): Promise<Block[]>;
}

/**
 * Store state interface
 */
export interface StoreState {
  // Data
  blocks: Map<string, Block>;
  pages: Map<string, Page>;

  // UI state
  currentPageId: string | null;
  zoomedBlockId: string | null;
  focusedBlockId: string | null;
  selectedBlockIds: Set<string>;

  // Storage adapter
  adapter: StorageAdapter;
}

/**
 * Store actions interface
 */
export interface StoreActions {
  // Block CRUD
  createBlock(block: Partial<Block> & Pick<Block, 'pageId' | 'content'>): Promise<Block>;
  updateBlock(id: string, updates: Partial<Block>): Promise<void>;
  deleteBlock(id: string): Promise<void>;

  // Block tree operations
  moveBlock(blockId: string, newParentId: string | null, newOrder: number): Promise<void>;
  indentBlock(blockId: string): Promise<void>;
  outdentBlock(blockId: string): Promise<void>;

  // Block state
  toggleCollapse(blockId: string): Promise<void>;

  // Page CRUD
  createPage(name: string, properties?: Record<string, unknown>): Promise<Page>;
  updatePage(id: string, updates: Partial<Page>): Promise<void>;
  deletePage(id: string): Promise<void>;

  // Navigation
  setCurrentPage(pageId: string | null): void;
  zoomToBlock(blockId: string | null): void;
  focusBlock(blockId: string | null): void;
  selectBlocks(blockIds: string[]): void;
  addToSelection(blockId: string): void;
  removeFromSelection(blockId: string): void;
  clearSelection(): void;

  // Queries
  getBlock(id: string): Block | null;
  getPage(id: string): Page | null;
  getPageBlocks(pageId: string): Block[];
  getChildren(blockId: string): Block[];
  getParent(blockId: string): Block | null;
  getSiblings(blockId: string): Block[];
  getBlockPath(blockId: string): Block[];

  // Initialization
  loadPage(pageId: string): Promise<void>;
  loadAllPages(): Promise<void>;
  setAdapter(adapter: StorageAdapter): void;
}

/**
 * Combined store type
 */
export type Store = StoreState & StoreActions;
