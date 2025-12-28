/**
 * BlockEditor Component
 *
 * A simple inline editor for editing individual blocks with support for:
 * - Auto-resizing textarea
 * - Keyboard shortcuts (Enter, Tab, Shift+Tab, etc.)
 * - Real-time content updates
 * - Block creation and deletion
 */

import React, { useRef, useEffect, useState, type KeyboardEvent } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { useBlockStore } from '../store';
import type { Block } from '../types';

export interface BlockEditorProps {
  /** The block to edit */
  block: Block;

  /** Whether this editor should be focused on mount */
  autoFocus?: boolean;

  /** Callback when user wants to create a new block (Enter key) */
  onCreateBlock?: (afterBlockId: string) => void;

  /** Callback when user wants to delete this block (Backspace on empty) */
  onDeleteBlock?: (blockId: string) => void;

  /** Callback when user wants to indent (Tab key) */
  onIndent?: (blockId: string) => void;

  /** Callback when user wants to outdent (Shift+Tab key) */
  onOutdent?: (blockId: string) => void;

  /** Callback when user wants to focus previous block (ArrowUp) */
  onFocusPrevious?: (blockId: string) => void;

  /** Callback when user wants to focus next block (ArrowDown) */
  onFocusNext?: (blockId: string) => void;

  /** Optional CSS class */
  className?: string;
}

/**
 * BlockEditor - Inline editor for a single block
 */
export const BlockEditor: React.FC<BlockEditorProps> = ({
  block,
  autoFocus = false,
  onCreateBlock,
  onDeleteBlock,
  onIndent,
  onOutdent,
  onFocusPrevious,
  onFocusNext,
  className = '',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState(block.content);
  const updateBlock = useBlockStore((state) => state.updateBlock);

  // Sync content with block prop
  useEffect(() => {
    setContent(block.content);
  }, [block.content]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
      // Move cursor to end
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Debounced update to store
    updateBlock(block.id, { content: newContent }).catch(console.error);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = e.currentTarget;
    const cursorPos = textarea.selectionStart;
    const isAtStart = cursorPos === 0;
    const isAtEnd = cursorPos === content.length;

    // Enter: Create new block below
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onCreateBlock?.(block.id);
    }

    // Backspace on empty block: Delete block
    if (e.key === 'Backspace' && content.trim() === '' && isAtStart) {
      e.preventDefault();
      onDeleteBlock?.(block.id);
    }

    // Tab: Indent block
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      onIndent?.(block.id);
    }

    // Shift+Tab: Outdent block
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      onOutdent?.(block.id);
    }

    // ArrowUp at start: Focus previous block
    if (e.key === 'ArrowUp' && isAtStart && !e.shiftKey && !e.metaKey) {
      e.preventDefault();
      onFocusPrevious?.(block.id);
    }

    // ArrowDown at end: Focus next block
    if (e.key === 'ArrowDown' && isAtEnd && !e.shiftKey && !e.metaKey) {
      e.preventDefault();
      onFocusNext?.(block.id);
    }
  };

  return (
    <div className={`block-editor ${className}`}>
      <TextareaAutosize
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="block-editor-textarea"
        placeholder="Enter content..."
        minRows={1}
        maxRows={20}
      />
    </div>
  );
};

export default BlockEditor;
