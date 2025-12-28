/**
 * Real-time link detection for autocomplete functionality
 */

export interface TriggerDetection {
  type: 'page' | 'block' | 'tag';
  query: string;
  startPos: number;
}

/**
 * Detect if the user just typed a trigger character ([[, ((, or #) for autocomplete
 * @param value - The current text value
 * @param cursorPos - Current cursor position
 * @returns Detection result with type, query, and start position, or null if no trigger detected
 */
export function detectTrigger(
  value: string,
  cursorPos: number
): TriggerDetection | null {
  if (cursorPos === 0) return null;

  // Get the text before the cursor
  const textBeforeCursor = value.slice(0, cursorPos);

  // Check for page reference trigger [[
  const pageRefMatch = textBeforeCursor.match(/\[\[([^\]]*)$/);
  if (pageRefMatch) {
    return {
      type: 'page',
      query: pageRefMatch[1],
      startPos: cursorPos - pageRefMatch[1].length,
    };
  }

  // Check for block reference trigger ((
  const blockRefMatch = textBeforeCursor.match(/\(\(([^\)]*)$/);
  if (blockRefMatch) {
    return {
      type: 'block',
      query: blockRefMatch[1],
      startPos: cursorPos - blockRefMatch[1].length,
    };
  }

  // Check for tag trigger #
  // Tag should be at word boundary (start of text, after space, or after newline)
  const tagMatch = textBeforeCursor.match(/(?:^|[\s\n])#([^\s#\[]*)$/);
  if (tagMatch) {
    const query = tagMatch[1];
    return {
      type: 'tag',
      query: query,
      startPos: cursorPos - query.length,
    };
  }

  // Check for tag with brackets trigger #[[
  const tagBracketMatch = textBeforeCursor.match(/(?:^|[\s\n])#\[\[([^\]]*)$/);
  if (tagBracketMatch) {
    return {
      type: 'tag',
      query: tagBracketMatch[1],
      startPos: cursorPos - tagBracketMatch[1].length,
    };
  }

  return null;
}
