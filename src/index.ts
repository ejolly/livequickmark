/**
 * Live Quick Mark - Markdown Editor Library
 *
 * A powerful outliner-based markdown editor library with:
 * - Block-based hierarchical content structure
 * - Full markdown support via mldoc parser
 * - Bi-directional linking ([[page]] and ((block-ref)))
 * - Tag support (#tag)
 * - Pluggable storage adapters
 * - React components for rendering and editing
 *
 * @packageDocumentation
 */

// ============================================================================
// Components
// ============================================================================

/**
 * Core UI Components
 */
export {
  Outliner,
  Block,
  BlockTree,
  Breadcrumb,
  Autocomplete,
  AutocompleteProvider,
  useAutocomplete,
  useAutocompleteContext,
} from './components';

export type {
  OutlinerProps,
  BlockProps,
  BlockTreeProps,
  BreadcrumbProps,
  AutocompleteProps,
  AutocompleteItem,
  AutocompleteContextValue,
  UseAutocompleteOptions,
  UseAutocompleteReturn,
} from './components';

// ============================================================================
// Editor
// ============================================================================

/**
 * Editor Components and Hooks
 */
export { BlockEditor } from './editor';
export type { BlockEditorProps } from './editor';

export { useAutopair } from './editor';
export type { AutopairUtils } from './editor';

export { useCursor } from './editor';
export type { CursorPosition, CursorUtils } from './editor';

/**
 * Renderer Components
 */
export { Renderer, BlockRenderer, InlineRenderer } from './renderer';
export type { RendererProps } from './renderer';

// ============================================================================
// Store
// ============================================================================

/**
 * State Management
 */
export {
  useBlockStore,
  selectCurrentPage,
  selectCurrentPageBlocks,
  selectZoomedBlock,
  selectFocusedBlock,
  selectSelectedBlocks,
} from './store';

export { MemoryStorageAdapter, createMemoryAdapter } from './store';

export type {
  Page,
  StorageAdapter,
  StoreState,
  StoreActions,
  Store,
} from './store';

// ============================================================================
// Types
// ============================================================================

/**
 * Type Definitions
 */
export type * from './types';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Link Detection and Parsing
 */
export {
  // Page references
  PAGE_REF_RE,
  PAGE_REF_RE_GLOBAL,
  isPageRef,
  createPageRef,
  getPageName,
  extractAllPageRefs,
  // Block references
  BLOCK_REF_RE,
  BLOCK_REF_RE_GLOBAL,
  isBlockRef,
  createBlockRef,
  getBlockRefId,
  extractAllBlockRefs,
  // Tags
  TAG_RE,
  TAG_RE_GLOBAL,
  isTag,
  createTag,
  getTagName,
  extractAllTags,
  // Real-time detection
  detectTrigger,
} from './links';

export type { TriggerDetection } from './links';

/**
 * Parser
 */
export { parseContent, parseInline, parse, createConfig, defaultConfig } from './parser';
export type { ParserConfig, ParsedBlock, ParsedBlocks } from './types';

// ============================================================================
// Version
// ============================================================================

/**
 * Library version
 */
export const VERSION = '0.1.0';

// ============================================================================
// Default Export (for convenience)
// ============================================================================

// Import values for default export
import { Outliner } from './components';
import { BlockEditor } from './editor';
import { Renderer, BlockRenderer, InlineRenderer } from './renderer';
import { useBlockStore, createMemoryAdapter } from './store';
import { parseContent, parseInline, parse, createConfig, defaultConfig } from './parser';
import { detectTrigger, isPageRef, isBlockRef, isTag } from './links';

export default {
  // Components
  Outliner,
  BlockEditor,
  Renderer,
  BlockRenderer,
  InlineRenderer,

  // Store
  useBlockStore,
  createMemoryAdapter,

  // Parser
  parseContent,
  parseInline,
  parse,
  createConfig,
  defaultConfig,

  // Links
  detectTrigger,
  isPageRef,
  isBlockRef,
  isTag,

  // Version
  VERSION,
};
