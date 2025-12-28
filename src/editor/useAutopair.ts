/**
 * useAutopair Hook
 * Provides auto-pairing functionality for brackets and delimiters
 */

import { useCallback } from 'react';
import { useCursor } from './useCursor';

/**
 * Map of opening characters to their closing pairs
 */
const AUTOPAIR_MAP: Record<string, string> = {
  '[': ']',
  '(': ')',
  '{': '}',
  '`': '`',
  '~': '~',
  '*': '*',
  '_': '_',
  '^': '^',
  '=': '=',
};

/**
 * Get all closing characters from the autopair map
 */
const CLOSING_CHARS = new Set(Object.values(AUTOPAIR_MAP));

export interface AutopairUtils {
  handleKeyPress: (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    value: string,
    onChange: (value: string) => void
  ) => boolean;
}

/**
 * Hook that provides auto-pairing functionality for brackets and delimiters
 *
 * Features:
 * - Auto-pairs opening brackets with closing ones
 * - Wraps selected text when typing an opener
 * - Skips over closing bracket when it's typed next to itself
 *
 * @example
 * ```tsx
 * const autopair = useAutopair();
 *
 * const handleKeyDown = (e) => {
 *   if (autopair.handleKeyPress(e, value, onChange)) {
 *     e.preventDefault();
 *   }
 * };
 * ```
 */
export const useAutopair = (): AutopairUtils => {
  const cursorUtils = useCursor();

  /**
   * Handle key press event for auto-pairing
   * Returns true if the event was handled and should be prevented
   */
  const handleKeyPress = useCallback((
    event: React.KeyboardEvent<HTMLTextAreaElement>,
    value: string,
    onChange: (value: string) => void
  ): boolean => {
    const textarea = event.currentTarget;
    const key = event.key;

    // Check if this is an opening character
    const closingChar = AUTOPAIR_MAP[key];
    if (closingChar) {
      const { start, end } = cursorUtils.getCursorPosition(textarea);
      const hasSelection = start !== end;

      if (hasSelection) {
        // Wrap the selection
        event.preventDefault();
        cursorUtils.wrapSelection(textarea, key, closingChar);
        // Update the value through onChange
        onChange(textarea.value);
        return true;
      } else {
        // Insert the pair and place cursor between them
        event.preventDefault();
        cursorUtils.insertAtCursor(textarea, key + closingChar);
        // Move cursor back by one to be between the pair
        cursorUtils.setCursorPosition(textarea, start + 1);
        // Update the value through onChange
        onChange(textarea.value);
        return true;
      }
    }

    // Check if this is a closing character being typed next to itself
    if (CLOSING_CHARS.has(key)) {
      const { start, end } = cursorUtils.getCursorPosition(textarea);
      const hasSelection = start !== end;

      // Only skip if no selection and the next character is the same
      if (!hasSelection && value.charAt(start) === key) {
        event.preventDefault();
        // Just move cursor forward
        cursorUtils.setCursorPosition(textarea, start + 1);
        return true;
      }
    }

    return false;
  }, [cursorUtils]);

  return {
    handleKeyPress,
  };
};
