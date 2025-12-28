/**
 * In-memory storage adapter implementation
 * Uses Maps for fast lookups, stores all data in memory
 */

import type { Block, Page, StorageAdapter } from './types';

export class MemoryStorageAdapter implements StorageAdapter {
  private blocks: Map<string, Block> = new Map();
  private pages: Map<string, Page> = new Map();

  // Block operations

  async getBlock(id: string): Promise<Block | null> {
    return this.blocks.get(id) || null;
  }

  async saveBlock(block: Block): Promise<void> {
    this.blocks.set(block.id, block);
  }

  async deleteBlock(id: string): Promise<void> {
    this.blocks.delete(id);
  }

  async getBlocks(ids: string[]): Promise<Map<string, Block>> {
    const result = new Map<string, Block>();
    for (const id of ids) {
      const block = this.blocks.get(id);
      if (block) {
        result.set(id, block);
      }
    }
    return result;
  }

  async saveBlocks(blocks: Block[]): Promise<void> {
    for (const block of blocks) {
      this.blocks.set(block.id, block);
    }
  }

  // Page operations

  async getPage(id: string): Promise<Page | null> {
    return this.pages.get(id) || null;
  }

  async getAllPages(): Promise<Page[]> {
    return Array.from(this.pages.values());
  }

  async savePage(page: Page): Promise<void> {
    this.pages.set(page.id, page);
  }

  async deletePage(id: string): Promise<void> {
    this.pages.delete(id);
  }

  // Query operations

  async getPageBlocks(pageId: string): Promise<Block[]> {
    const blocks = Array.from(this.blocks.values()).filter(
      (block) => block.pageId === pageId
    );
    // Sort by order
    return blocks.sort((a, b) => a.order - b.order);
  }

  async getChildBlocks(parentId: string): Promise<Block[]> {
    const blocks = Array.from(this.blocks.values()).filter(
      (block) => block.parentId === parentId
    );
    // Sort by order
    return blocks.sort((a, b) => a.order - b.order);
  }

  // Utility methods for testing and debugging

  clear(): void {
    this.blocks.clear();
    this.pages.clear();
  }

  getBlockCount(): number {
    return this.blocks.size;
  }

  getPageCount(): number {
    return this.pages.size;
  }

  getAllBlocks(): Block[] {
    return Array.from(this.blocks.values());
  }
}

/**
 * Create a new in-memory storage adapter instance
 */
export function createMemoryAdapter(): MemoryStorageAdapter {
  return new MemoryStorageAdapter();
}
