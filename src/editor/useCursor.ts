/**
 * useCursor Hook
 * Provides cursor manipulation utilities for textarea elements
 */

import { useCallback } from 'react';

export interface CursorPosition {
  start: number;
  end: number;
}

export interface CursorUtils {
  getCursorPosition: (textarea: HTMLTextAreaElement) => CursorPosition;
  setCursorPosition: (textarea: HTMLTextAreaElement, pos: number | CursorPosition) => void;
  getSelectedText: (textarea: HTMLTextAreaElement) => string;
  insertAtCursor: (textarea: HTMLTextAreaElement, text: string) => void;
  wrapSelection: (textarea: HTMLTextAreaElement, before: string, after: string) => void;
}

/**
 * Hook that provides cursor manipulation utilities for textarea elements
 *
 * @example
 * ```tsx
 * const cursorUtils = useCursor();
 * const handleClick = () => {
 *   const pos = cursorUtils.getCursorPosition(textareaRef.current);
 *   console.log('Cursor at:', pos);
 * };
 * ```
 */
export const useCursor = (): CursorUtils => {
  /**
   * Get the current cursor position or selection range
   */
  const getCursorPosition = useCallback((textarea: HTMLTextAreaElement): CursorPosition => {
    return {
      start: textarea.selectionStart,
      end: textarea.selectionEnd,
    };
  }, []);

  /**
   * Set the cursor position or selection range
   * If a number is provided, cursor is placed at that position
   * If a CursorPosition is provided, a selection range is created
   */
  const setCursorPosition = useCallback((
    textarea: HTMLTextAreaElement,
    pos: number | CursorPosition
  ): void => {
    if (typeof pos === 'number') {
      textarea.setSelectionRange(pos, pos);
    } else {
      textarea.setSelectionRange(pos.start, pos.end);
    }
    textarea.focus();
  }, []);

  /**
   * Get the currently selected text
   */
  const getSelectedText = useCallback((textarea: HTMLTextAreaElement): string => {
    const { start, end } = getCursorPosition(textarea);
    return textarea.value.substring(start, end);
  }, [getCursorPosition]);

  /**
   * Insert text at the current cursor position
   * Replaces any selected text
   */
  const insertAtCursor = useCallback((textarea: HTMLTextAreaElement, text: string): void => {
    const { start, end } = getCursorPosition(textarea);
    const value = textarea.value;
    const newValue = value.substring(0, start) + text + value.substring(end);

    textarea.value = newValue;

    // Place cursor after inserted text
    const newCursorPos = start + text.length;
    setCursorPosition(textarea, newCursorPos);

    // Trigger input event for React to detect the change
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  }, [getCursorPosition, setCursorPosition]);

  /**
   * Wrap the current selection with before and after strings
   * If no text is selected, inserts before+after and places cursor between them
   */
  const wrapSelection = useCallback((
    textarea: HTMLTextAreaElement,
    before: string,
    after: string
  ): void => {
    const { start, end } = getCursorPosition(textarea);
    const value = textarea.value;
    const selectedText = value.substring(start, end);

    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    textarea.value = newValue;

    // If there was a selection, select the wrapped text
    // Otherwise, place cursor between before and after
    if (selectedText) {
      setCursorPosition(textarea, {
        start: start + before.length,
        end: start + before.length + selectedText.length,
      });
    } else {
      setCursorPosition(textarea, start + before.length);
    }

    // Trigger input event for React to detect the change
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
  }, [getCursorPosition, setCursorPosition]);

  return {
    getCursorPosition,
    setCursorPosition,
    getSelectedText,
    insertAtCursor,
    wrapSelection,
  };
};
