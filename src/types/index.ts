/**
 * Type definitions for the live-quick-mark markdown editor
 *
 * This module provides comprehensive TypeScript types for:
 * - mldoc AST (Abstract Syntax Tree) structures
 * - Block-based data model for the store
 * - Parser configuration and utilities
 *
 * @module types
 */

// ============================================================================
// AST Types - mldoc parser output structures
// ============================================================================

export type {
  // Block-level AST types
  BlockAst,
  ParagraphBlock,
  HeadingBlock,
  ListBlock,
  SrcBlock,
  QuoteBlock,
  TableBlock,
  DrawerBlock,
  PropertyDrawerBlock,
  CustomBlock,
  HiccupBlock,
  RawHtmlBlock,
  LatexFragmentBlock,
  HorizontalRuleBlock,
  FootnoteDefinitionBlock,

  // Inline-level AST types
  InlineAst,
  PlainInline,
  EmphasisInline,
  LinkInline,
  NestedLinkInline,
  TagInline,
  CodeInline,
  VerbatimInline,
  MacroInline,
  TimestampInline,
  SubscriptInline,
  SuperscriptInline,
  LatexFragmentInline,
  InlineHtmlInline,
  EmailInline,
  CookieInline,
  FootnoteReferenceInline,

  // Supporting types
  EmphasisType,
  LinkUrlType,
  ComplexUrl,
  LinkData,
  NestedLinkData,
  HeadingData,
  HeadingMeta,
  ListData,
  ListItem,
  CheckboxState,
  SrcData,
  TableData,
  TableRow,
  TableCell,
  DrawerData,
  PropertyData,
  PropertyMap,
  LatexData,
  MacroData,
  TimestampData,
  DateData,
  TimeData,
  RepeatedData,
  EmailData,
  CookieData,
  FootnoteRefData,

  // Position and parsing
  Position,
  ParsedBlock,
  ParsedBlocks,
  ParserConfig,
  ExportOptions,

  // Utility types
  AstData,
  AstType,
} from './ast';

// Export type guards
export {
  isBlockType,
  isInlineType,
  isPageRef,
  isBlockRef,
  isComplexUrl,
} from './ast';

// ============================================================================
// Block Types - Store data structures
// ============================================================================

export type {
  // Core identifiers and primitives
  BlockId,
  PageId,
  Timestamp,

  // Block types
  Block,
  TaskMarker,
  Priority,
  BlockProperties,
  BlockRef,

  // Page types
  Page,
  PageProperties,
  PageRef,

  // Tree structures
  BlockTree,
  FlatBlock,
  PageTree,

  // Operations
  InsertPosition,
  CreateBlockData,
  UpdateBlockData,
  MoveBlockData,
  BlockOperationResult,

  // Selection and cursor
  BlockSelection,
  BlockCursor,
  BlockRange,

  // Search and filter
  BlockSearchResult,
  SearchHighlight,
  BlockFilter,

  // Relationships
  BlockReference,
  PageReference,
  Backlinks,

  // History
  BlockOperationType,
  BlockOperation,
  BlockHistory,

  // Store state
  BlocksMap,
  PagesMap,
  BlockStoreState,

  // Utility function types
  GenerateBlockId,
  GeneratePageId,
  GetTimestamp,
  ParseBlockContent,
  RenderAst,
} from './block';

// ============================================================================
// Re-export everything for convenience
// ============================================================================

export * from './ast';
export * from './block';

// ============================================================================
// Common Type Aliases
// ============================================================================

// Import types for use in type aliases below
import type { BlockAst, InlineAst } from './ast';
import type { Timestamp } from './block';

/**
 * Any AST node (block or inline)
 */
export type AnyAst = BlockAst | InlineAst;

/**
 * Any entity with an ID
 */
export type Entity = { id: string };

/**
 * Any entity with timestamps
 */
export type TimestampedEntity = {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

/**
 * Generic result type for operations
 */
export type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Generic callback function type
 */
export type Callback<T = void> = (value: T) => void;

/**
 * Generic async callback function type
 */
export type AsyncCallback<T = void> = (value: T) => Promise<void>;

/**
 * Generic predicate function type
 */
export type Predicate<T> = (value: T) => boolean;

/**
 * Generic transformer function type
 */
export type Transformer<T, R> = (value: T) => R;

/**
 * Generic comparator function type
 */
export type Comparator<T> = (a: T, b: T) => number;

// ============================================================================
// Renderer Callback Types
// ============================================================================

/**
 * Callback functions for the renderer components
 * Used to handle user interactions with rendered markdown elements
 */
export interface RendererCallbacks {
  /** Called when a page reference [[page]] is clicked */
  onPageClick?: (pageName: string) => void;

  /** Called when a block reference ((uuid)) is clicked */
  onBlockClick?: (blockId: string) => void;

  /** Called when a tag #tag is clicked */
  onTagClick?: (tag: string) => void;

  /** Called when a checkbox state changes in a list item */
  onCheckboxChange?: (checked: boolean, itemIndex: number[]) => void;
}
