/**
 * Link detection utilities for live-quick-mark markdown editor
 *
 * This module provides utilities for detecting and working with:
 * - Page references: [[page]]
 * - Block references: ((uuid))
 * - Tags: #tag or #[[tag with spaces]]
 */

// Page reference utilities
export {
  PAGE_REF_RE,
  PAGE_REF_RE_GLOBAL,
  isPageRef,
  createPageRef,
  getPageName,
  extractAllPageRefs,
} from './page-ref';

// Block reference utilities
export {
  BLOCK_REF_RE,
  BLOCK_REF_RE_GLOBAL,
  isBlockRef,
  createBlockRef,
  getBlockRefId,
  extractAllBlockRefs,
} from './block-ref';

// Tag utilities
export {
  TAG_RE,
  TAG_RE_GLOBAL,
  isTag,
  createTag,
  getTagName,
  extractAllTags,
} from './tag';

// Real-time detection utilities
export {
  detectTrigger,
  type TriggerDetection,
} from './detect';
