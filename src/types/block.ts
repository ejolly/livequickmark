/**
 * Block data types for the store
 *
 * These types represent the block-based data structure used for storing and managing
 * content in the markdown editor. Blocks are the fundamental units of content that
 * can be edited, nested, and organized hierarchically.
 */

import type { BlockAst } from './ast';

// ============================================================================
// Core Block Types
// ============================================================================

/**
 * Unique identifier for a block (UUID v4)
 */
export type BlockId = string;

/**
 * Unique identifier for a page
 */
export type PageId = string;

/**
 * Timestamp in ISO 8601 format
 */
export type Timestamp = string;

/**
 * Represents a single block of content
 *
 * A block is the fundamental unit of content in the editor. Each block has:
 * - Unique ID for referencing
 * - Text content in markdown format
 * - Optional parent-child relationships for nesting
 * - Collapsed state for hierarchical navigation
 * - Creation and modification timestamps
 * - Optional parsed AST for rendering
 */
export interface Block {
  /** Unique identifier (UUID v4) */
  id: BlockId;

  /** Raw markdown content */
  content: string;

  /** Parent block ID (null for top-level blocks) */
  parentId: BlockId | null;

  /** Array of child block IDs (for nested blocks) */
  children: BlockId[];

  /** Whether this block's children are collapsed/hidden */
  collapsed: boolean;

  /** Timestamp when the block was created */
  createdAt: Timestamp;

  /** Timestamp when the block was last updated */
  updatedAt: Timestamp;

  /** Optional properties/metadata */
  properties?: BlockProperties;

  /** Optional parsed AST (cached for performance) */
  ast?: BlockAst;

  /** Optional page this block belongs to */
  pageId?: PageId;

  /** Optional ordering index for siblings */
  order?: number;

  /** Optional UUID for block references ((uuid)) */
  uuid?: string;

  /** Whether this block is currently being edited */
  editing?: boolean;

  /** Optional marker (TODO, DONE, etc.) */
  marker?: TaskMarker;

  /** Optional priority (A, B, C, etc.) */
  priority?: Priority;

  /** Optional tags */
  tags?: string[];

  /** Optional heading level (1-6) */
  level?: number;
}

/**
 * Task marker states
 */
export type TaskMarker =
  | 'TODO'
  | 'DOING'
  | 'DONE'
  | 'WAITING'
  | 'CANCELED'
  | 'NOW'
  | 'LATER';

/**
 * Priority levels
 */
export type Priority = 'A' | 'B' | 'C';

/**
 * Custom properties for a block (key-value pairs)
 */
export type BlockProperties = Record<string, string | number | boolean>;

/**
 * Minimal block representation for efficient rendering
 */
export interface BlockRef {
  id: BlockId;
  content: string;
}

// ============================================================================
// Page Types
// ============================================================================

/**
 * Represents a page containing blocks
 *
 * A page is a collection of blocks organized hierarchically. Pages can represent:
 * - Individual documents/notes
 * - Wiki pages
 * - Daily journal entries
 * - Any logical grouping of blocks
 */
export interface Page {
  /** Unique identifier */
  id: PageId;

  /** Page title/name */
  title: string;

  /** Top-level block IDs (in order) */
  blocks: BlockId[];

  /** Timestamp when the page was created */
  createdAt: Timestamp;

  /** Timestamp when the page was last updated */
  updatedAt: Timestamp;

  /** Optional page properties/metadata */
  properties?: PageProperties;

  /** Optional namespace/folder */
  namespace?: string;

  /** Optional tags */
  tags?: string[];

  /** Whether this is a journal page */
  journal?: boolean;

  /** For journal pages, the date */
  journalDate?: string;

  /** Optional icon/emoji */
  icon?: string;

  /** Optional cover image */
  cover?: string;

  /** Whether this page is public */
  public?: boolean;

  /** Whether this page is favorited */
  favorite?: boolean;
}

/**
 * Custom properties for a page
 */
export type PageProperties = Record<string, string | number | boolean>;

/**
 * Minimal page representation for lists and references
 */
export interface PageRef {
  id: PageId;
  title: string;
}

// ============================================================================
// Tree Structures
// ============================================================================

/**
 * Hierarchical representation of a block with its children
 *
 * Used for rendering the outline/tree view and for operations that need
 * to traverse the block hierarchy efficiently.
 */
export interface BlockTree {
  /** The block data */
  block: Block;

  /** Children as nested BlockTree nodes */
  children: BlockTree[];

  /** Depth level in the tree (0 for root) */
  depth: number;

  /** Path from root to this node (array of block IDs) */
  path: BlockId[];

  /** Whether this node has any children */
  hasChildren: boolean;

  /** Whether all descendants are visible (not collapsed) */
  expanded: boolean;
}

/**
 * Flat representation of the block tree with depth information
 *
 * Useful for efficient rendering of long lists without recursion.
 */
export interface FlatBlock {
  id: BlockId;
  content: string;
  depth: number;
  hasChildren: boolean;
  collapsed: boolean;
  parentId: BlockId | null;
}

/**
 * Page with its complete block tree
 */
export interface PageTree {
  page: Page;
  blocks: BlockTree[];
}

// ============================================================================
// Block Operations
// ============================================================================

/**
 * Position where a new block should be inserted
 */
export interface InsertPosition {
  /** Reference block ID */
  referenceId: BlockId;

  /** Position relative to reference block */
  position: 'before' | 'after' | 'firstChild' | 'lastChild';
}

/**
 * Data for creating a new block
 */
export interface CreateBlockData {
  content: string;
  parentId?: BlockId | null;
  properties?: BlockProperties;
  marker?: TaskMarker;
  priority?: Priority;
  tags?: string[];
}

/**
 * Data for updating an existing block
 */
export interface UpdateBlockData {
  content?: string;
  properties?: BlockProperties;
  collapsed?: boolean;
  marker?: TaskMarker;
  priority?: Priority;
  tags?: string[];
}

/**
 * Data for moving a block
 */
export interface MoveBlockData {
  blockId: BlockId;
  newParentId: BlockId | null;
  position: InsertPosition;
}

/**
 * Result of a block operation
 */
export interface BlockOperationResult {
  success: boolean;
  blockId?: BlockId;
  error?: string;
}

// ============================================================================
// Selection and Range
// ============================================================================

/**
 * Represents a selection of blocks
 */
export interface BlockSelection {
  /** Selected block IDs */
  blocks: BlockId[];

  /** Anchor block (where selection started) */
  anchorId: BlockId | null;

  /** Focus block (where selection ended) */
  focusId: BlockId | null;
}

/**
 * Cursor position within a block
 */
export interface BlockCursor {
  /** Block ID */
  blockId: BlockId;

  /** Character offset within the block content */
  offset: number;
}

/**
 * Range spanning multiple blocks
 */
export interface BlockRange {
  /** Start position */
  start: BlockCursor;

  /** End position */
  end: BlockCursor;
}

// ============================================================================
// Search and Filter
// ============================================================================

/**
 * Search result for a block
 */
export interface BlockSearchResult {
  /** Matching block */
  block: Block;

  /** Relevance score (0-1) */
  score: number;

  /** Highlighted matches in content */
  highlights?: SearchHighlight[];

  /** Page containing this block */
  page?: PageRef;

  /** Breadcrumb path to this block */
  breadcrumbs?: string[];
}

/**
 * Highlighted search match
 */
export interface SearchHighlight {
  /** Start offset in content */
  start: number;

  /** End offset in content */
  end: number;

  /** Matched text */
  text: string;
}

/**
 * Filter options for querying blocks
 */
export interface BlockFilter {
  /** Filter by page ID */
  pageId?: PageId;

  /** Filter by parent block ID */
  parentId?: BlockId | null;

  /** Filter by marker */
  marker?: TaskMarker;

  /** Filter by priority */
  priority?: Priority;

  /** Filter by tags (all must match) */
  tags?: string[];

  /** Filter by properties */
  properties?: Partial<BlockProperties>;

  /** Filter by date range */
  dateRange?: {
    start: Timestamp;
    end: Timestamp;
  };

  /** Include children */
  includeChildren?: boolean;
}

// ============================================================================
// Relationships and References
// ============================================================================

/**
 * Reference from one block to another
 */
export interface BlockReference {
  /** Source block ID */
  fromBlockId: BlockId;

  /** Target block ID */
  toBlockId: BlockId;

  /** Type of reference */
  type: 'block-ref' | 'embed';
}

/**
 * Reference from a block to a page
 */
export interface PageReference {
  /** Source block ID */
  fromBlockId: BlockId;

  /** Target page ID or title */
  toPage: PageId | string;

  /** Type of reference */
  type: 'page-ref' | 'tag';
}

/**
 * Backlinks to a block or page
 */
export interface Backlinks {
  /** Target block or page ID */
  targetId: BlockId | PageId;

  /** List of blocks that reference the target */
  references: BlockRef[];

  /** Total count */
  count: number;
}

// ============================================================================
// History and Undo/Redo
// ============================================================================

/**
 * Types of block operations for undo/redo
 */
export type BlockOperationType =
  | 'create'
  | 'update'
  | 'delete'
  | 'move'
  | 'indent'
  | 'outdent';

/**
 * A single operation in the undo/redo history
 */
export interface BlockOperation {
  /** Type of operation */
  type: BlockOperationType;

  /** Timestamp when operation occurred */
  timestamp: Timestamp;

  /** Block ID(s) affected */
  blockIds: BlockId[];

  /** State before the operation (for undo) */
  before?: Partial<Block> | Partial<Block>[];

  /** State after the operation (for redo) */
  after?: Partial<Block> | Partial<Block>[];
}

/**
 * History stack for undo/redo
 */
export interface BlockHistory {
  /** Stack of undo operations */
  undoStack: BlockOperation[];

  /** Stack of redo operations */
  redoStack: BlockOperation[];

  /** Maximum history size */
  maxSize: number;

  /** Current position in history */
  position: number;
}

// ============================================================================
// Store State Types
// ============================================================================

/**
 * Map of block IDs to blocks
 */
export type BlocksMap = Map<BlockId, Block>;

/**
 * Map of page IDs to pages
 */
export type PagesMap = Map<PageId, Page>;

/**
 * Block store state
 */
export interface BlockStoreState {
  /** All blocks by ID */
  blocks: BlocksMap;

  /** All pages by ID */
  pages: PagesMap;

  /** Currently selected block ID */
  selectedBlockId: BlockId | null;

  /** Currently active page ID */
  activePageId: PageId | null;

  /** Current selection */
  selection: BlockSelection | null;

  /** Undo/redo history */
  history: BlockHistory;

  /** Whether the store is loading */
  loading: boolean;

  /** Error state */
  error: string | null;
}

// ============================================================================
// Utility Functions Types
// ============================================================================

/**
 * Function to generate a new block ID
 */
export type GenerateBlockId = () => BlockId;

/**
 * Function to generate a new page ID
 */
export type GeneratePageId = () => PageId;

/**
 * Function to get current timestamp
 */
export type GetTimestamp = () => Timestamp;

/**
 * Function to parse block content to AST
 */
export type ParseBlockContent = (content: string) => BlockAst | null;

/**
 * Function to render AST to React elements
 */
export type RenderAst = (ast: BlockAst) => React.ReactNode;
