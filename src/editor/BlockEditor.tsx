/**
 * BlockEditor Component
 * A single-block markdown editor with auto-expanding textarea
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Renderer } from '../renderer';
import { useAutopair } from './useAutopair';
import { useCursor } from './useCursor';

export interface BlockEditorProps {
  /** The content of the block */
  content: string;

  /** Called when the content changes */
  onChange: (content: string) => void;

  /** Called when Enter is pressed (to split block) */
  onEnter?: (cursorPosition: number) => void;

  /** Called when Backspace is pressed at the start of the block */
  onBackspace?: () => void;

  /** Called when Tab is pressed (to indent block) */
  onIndent?: () => void;

  /** Called when Shift+Tab is pressed (to outdent block) */
  onOutdent?: () => void;

  /** Called when the editor receives focus */
  onFocus?: () => void;

  /** Called when the editor loses focus */
  onBlur?: () => void;

  /** Placeholder text when content is empty */
  placeholder?: string;

  /** Whether the editor is read-only */
  readOnly?: boolean;

  /** Optional CSS class name */
  className?: string;

  /** Auto-focus the editor on mount */
  autoFocus?: boolean;
}

/**
 * BlockEditor - A single-block markdown editor component
 *
 * Features:
 * - Toggles between edit mode (textarea) and rendered mode
 * - Auto-expands textarea as content grows
 * - Handles Enter, Backspace, Tab, and Escape keys
 * - Auto-pairs brackets and delimiters
 * - Handles IME composition properly
 *
 * @example
 * ```tsx
 * <BlockEditor
 *   content={block.content}
 *   onChange={(content) => updateBlock(block.id, content)}
 *   onEnter={(pos) => splitBlock(block.id, pos)}
 *   onBackspace={() => mergeWithPrevious(block.id)}
 *   onIndent={() => indentBlock(block.id)}
 *   onOutdent={() => outdentBlock(block.id)}
 *   placeholder="Type something..."
 * />
 * ```
 */
export const BlockEditor: React.FC<BlockEditorProps> = ({
  content,
  onChange,
  onEnter,
  onBackspace,
  onIndent,
  onOutdent,
  onFocus,
  onBlur,
  placeholder = 'Type here...',
  readOnly = false,
  className = 'block-editor',
  autoFocus = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autopair = useAutopair();
  const cursorUtils = useCursor();

  // Auto-focus on mount if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      setIsEditing(true);
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  /**
   * Switch to edit mode
   */
  const enterEditMode = useCallback(() => {
    if (readOnly) return;
    setIsEditing(true);
    // Focus the textarea after state update
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  }, [readOnly]);

  /**
   * Switch to rendered mode
   */
  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    onBlur?.();
  }, [onBlur]);

  /**
   * Handle textarea change
   */
  const handleChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  }, [onChange]);

  /**
   * Handle textarea focus
   */
  const handleFocus = useCallback(() => {
    onFocus?.();
  }, [onFocus]);

  /**
   * Handle textarea blur
   */
  const handleBlur = useCallback(() => {
    // Small delay to allow other events to fire first
    setTimeout(() => {
      exitEditMode();
    }, 100);
  }, [exitEditMode]);

  /**
   * Handle IME composition start
   */
  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  /**
   * Handle IME composition end
   */
  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
  }, []);

  /**
   * Handle key down events
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Don't handle events during IME composition
    if (isComposing) return;

    const textarea = event.currentTarget;
    const { start, end } = cursorUtils.getCursorPosition(textarea);

    // Handle Enter key (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (onEnter) {
        onEnter(start);
      }
      return;
    }

    // Handle Escape key
    if (event.key === 'Escape') {
      event.preventDefault();
      exitEditMode();
      return;
    }

    // Handle Tab key for indent/outdent
    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        onOutdent?.();
      } else {
        onIndent?.();
      }
      return;
    }

    // Handle Backspace at start of block
    if (event.key === 'Backspace' && start === 0 && end === 0) {
      event.preventDefault();
      onBackspace?.();
      return;
    }

    // Handle auto-pairing
    if (autopair.handleKeyPress(event, content, onChange)) {
      // Event was handled by autopair
      return;
    }
  }, [
    isComposing,
    content,
    onChange,
    onEnter,
    onBackspace,
    onIndent,
    onOutdent,
    exitEditMode,
    autopair,
    cursorUtils,
  ]);

  /**
   * Handle click on rendered content
   */
  const handleRenderedClick = useCallback(() => {
    enterEditMode();
  }, [enterEditMode]);

  // Render edit mode
  if (isEditing) {
    return (
      <div className={`${className} ${className}--editing`}>
        <TextareaAutosize
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`${className}__textarea`}
          minRows={1}
        />
      </div>
    );
  }

  // Render rendered mode
  return (
    <div
      className={`${className} ${className}--rendered`}
      onClick={handleRenderedClick}
    >
      {content ? (
        <Renderer content={content} className={`${className}__renderer`} />
      ) : (
        <div className={`${className}__placeholder`}>{placeholder}</div>
      )}
    </div>
  );
};
