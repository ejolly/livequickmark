/**
 * Block reference utilities for ((uuid)) syntax
 */

/**
 * Regular expression to match block references in the format ((uuid))
 * Matches UUIDs in format: 8-4-4-4-12 hexadecimal characters
 */
export const BLOCK_REF_RE = /\(\(([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\)\)/;

/**
 * Global version of BLOCK_REF_RE for extracting all matches
 */
export const BLOCK_REF_RE_GLOBAL = /\(\(([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\)\)/g;

/**
 * Check if a string is a block reference
 * @param s - String to check
 * @returns true if the string matches ((uuid)) format
 */
export function isBlockRef(s: string): boolean {
  return BLOCK_REF_RE.test(s);
}

/**
 * Create a block reference from a block ID
 * @param blockId - UUID of the block
 * @returns Formatted block reference ((blockId))
 */
export function createBlockRef(blockId: string): string {
  return `((${blockId}))`;
}

/**
 * Extract the block ID from a block reference
 * @param s - String containing a block reference
 * @returns The block UUID without parentheses, or null if not a valid block reference
 */
export function getBlockRefId(s: string): string | null {
  const match = s.match(BLOCK_REF_RE);
  return match ? match[1] : null;
}

/**
 * Extract all block IDs from content
 * @param content - Text content to search
 * @returns Array of block UUIDs (without parentheses)
 */
export function extractAllBlockRefs(content: string): string[] {
  const matches = content.matchAll(BLOCK_REF_RE_GLOBAL);
  const blockIds: string[] = [];

  for (const match of matches) {
    if (match[1]) {
      blockIds.push(match[1]);
    }
  }

  return blockIds;
}
