/**
 * Page reference utilities for [[page]] syntax
 */

/**
 * Regular expression to match page references in the format [[page]]
 * Matches: [[page name]] or [[nested/page]]
 */
export const PAGE_REF_RE = /\[\[([^\]]+)\]\]/;

/**
 * Global version of PAGE_REF_RE for extracting all matches
 */
export const PAGE_REF_RE_GLOBAL = /\[\[([^\]]+)\]\]/g;

/**
 * Check if a string is a page reference
 * @param s - String to check
 * @returns true if the string matches [[page]] format
 */
export function isPageRef(s: string): boolean {
  return PAGE_REF_RE.test(s);
}

/**
 * Create a page reference from a page name
 * @param pageName - Name of the page
 * @returns Formatted page reference [[pageName]]
 */
export function createPageRef(pageName: string): string {
  return `[[${pageName}]]`;
}

/**
 * Extract the page name from a page reference
 * @param s - String containing a page reference
 * @returns The page name without brackets, or null if not a valid page reference
 */
export function getPageName(s: string): string | null {
  const match = s.match(PAGE_REF_RE);
  return match ? match[1] : null;
}

/**
 * Extract all page names from content
 * @param content - Text content to search
 * @returns Array of page names (without brackets)
 */
export function extractAllPageRefs(content: string): string[] {
  const matches = content.matchAll(PAGE_REF_RE_GLOBAL);
  const pageNames: string[] = [];

  for (const match of matches) {
    if (match[1]) {
      pageNames.push(match[1]);
    }
  }

  return pageNames;
}
