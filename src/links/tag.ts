/**
 * Tag utilities for #tag and #[[tag with spaces]] syntax
 */

/**
 * Regular expression to match tags in the format #tag or #[[tag with spaces]]
 * Matches:
 * - #simple-tag (alphanumeric, hyphens, underscores)
 * - #[[tag with spaces]]
 */
export const TAG_RE = /#(?:\[\[([^\]]+)\]\]|([a-zA-Z0-9_-]+))/;

/**
 * Global version of TAG_RE for extracting all matches
 */
export const TAG_RE_GLOBAL = /#(?:\[\[([^\]]+)\]\]|([a-zA-Z0-9_-]+))/g;

/**
 * Check if a string is a tag
 * @param s - String to check
 * @returns true if the string matches #tag or #[[tag]] format
 */
export function isTag(s: string): boolean {
  return TAG_RE.test(s);
}

/**
 * Create a tag from a tag name
 * Automatically adds brackets if the tag contains spaces
 * @param tagName - Name of the tag
 * @returns Formatted tag (#tag or #[[tag with spaces]])
 */
export function createTag(tagName: string): string {
  // Use brackets if tag contains spaces or special characters
  if (/\s/.test(tagName) || !/^[a-zA-Z0-9_-]+$/.test(tagName)) {
    return `#[[${tagName}]]`;
  }
  return `#${tagName}`;
}

/**
 * Extract the tag name from a tag
 * @param s - String containing a tag
 * @returns The tag name without # and brackets, or null if not a valid tag
 */
export function getTagName(s: string): string | null {
  const match = s.match(TAG_RE);
  if (!match) return null;

  // match[1] is for #[[tag]], match[2] is for #tag
  return match[1] || match[2] || null;
}

/**
 * Extract all tag names from content
 * @param content - Text content to search
 * @returns Array of tag names (without # and brackets)
 */
export function extractAllTags(content: string): string[] {
  const matches = content.matchAll(TAG_RE_GLOBAL);
  const tagNames: string[] = [];

  for (const match of matches) {
    // match[1] is for #[[tag]], match[2] is for #tag
    const tagName = match[1] || match[2];
    if (tagName) {
      tagNames.push(tagName);
    }
  }

  return tagNames;
}
