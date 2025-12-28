/**
 * Block store - Re-exports
 */

// Export types
export type {
  Block,
  Page,
  StorageAdapter,
  StoreState,
  StoreActions,
  Store,
} from './types';

// Export store and selectors
export {
  useBlockStore,
  selectCurrentPage,
  selectCurrentPageBlocks,
  selectZoomedBlock,
  selectFocusedBlock,
  selectSelectedBlocks,
} from './store';

// Export adapters
export { MemoryStorageAdapter, createMemoryAdapter } from './memory-adapter';
