/**
 * Hook for managing autocomplete state
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { detectTrigger } from '../links';
import Fuse from 'fuse.js';
import type { AutocompleteItem } from './Autocomplete';

export interface AutocompleteState {
  isOpen: boolean;
  query: string;
  type: 'page' | 'block' | 'tag';
  position: { top: number; left: number };
  selectedIndex: number;
  items: AutocompleteItem[];
}

export interface UseAutocompleteOptions {
  allItems: AutocompleteItem[];
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  onInsert?: (text: string) => void;
}

export interface UseAutocompleteReturn extends AutocompleteState {
  handleKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => boolean;
  handleInput: (value: string, cursorPos: number) => void;
  handleSelect: (item: AutocompleteItem) => void;
  close: () => void;
}

/**
 * Hook for managing autocomplete state and behavior
 */
export const useAutocomplete = ({
  allItems,
  textareaRef,
  onInsert,
}: UseAutocompleteOptions): UseAutocompleteReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [type, setType] = useState<'page' | 'block' | 'tag'>('page');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [items, setItems] = useState<AutocompleteItem[]>([]);
  const [_triggerStart, setTriggerStart] = useState(0);

  // Fuse.js instances for each type
  const fuseRef = useRef<Map<string, Fuse<AutocompleteItem>>>(new Map());

  // Initialize Fuse.js instances when items change
  useEffect(() => {
    const pageItems = allItems.filter((item) => item.type === 'page');
    const blockItems = allItems.filter((item) => item.type === 'block');
    const tagItems = allItems.filter((item) => item.type === 'tag');

    fuseRef.current.set(
      'page',
      new Fuse(pageItems, {
        keys: ['title'],
        threshold: 0.4,
      })
    );

    fuseRef.current.set(
      'block',
      new Fuse(blockItems, {
        keys: ['title'],
        threshold: 0.4,
      })
    );

    fuseRef.current.set(
      'tag',
      new Fuse(tagItems, {
        keys: ['title'],
        threshold: 0.4,
      })
    );
  }, [allItems]);

  // Calculate cursor position for dropdown placement
  const calculatePosition = useCallback((textarea: HTMLTextAreaElement, cursorPos: number) => {
    // Create a mirror div to calculate cursor position
    const div = document.createElement('div');
    const styles = window.getComputedStyle(textarea);

    // Copy relevant styles
    [
      'font-family',
      'font-size',
      'font-weight',
      'line-height',
      'letter-spacing',
      'padding',
      'border',
      'white-space',
      'word-wrap',
      'overflow-wrap',
    ].forEach((prop) => {
      div.style.setProperty(prop, styles.getPropertyValue(prop));
    });

    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.width = `${textarea.clientWidth}px`;
    div.style.height = 'auto';
    div.style.whiteSpace = 'pre-wrap';

    document.body.appendChild(div);

    // Add text up to cursor position
    const textBeforeCursor = textarea.value.substring(0, cursorPos);
    div.textContent = textBeforeCursor;

    // Add a span at the cursor position
    const span = document.createElement('span');
    span.textContent = '|';
    div.appendChild(span);

    // Calculate position
    const textareaRect = textarea.getBoundingClientRect();
    const spanRect = span.getBoundingClientRect();

    const top = spanRect.top - textareaRect.top + textarea.scrollTop + 20;
    const left = spanRect.left - textareaRect.left + textarea.scrollLeft;

    document.body.removeChild(div);

    return { top, left };
  }, []);

  // Filter items based on query
  const filterItems = useCallback(
    (searchQuery: string, itemType: 'page' | 'block' | 'tag'): AutocompleteItem[] => {
      const fuse = fuseRef.current.get(itemType);
      if (!fuse) return [];

      if (!searchQuery || !searchQuery.trim()) {
        // Return all items of this type
        return allItems.filter((item) => item.type === itemType).slice(0, 10);
      }

      // Use Fuse.js for fuzzy search
      const results = fuse.search(searchQuery);
      return results.map((result) => result.item).slice(0, 10);
    },
    [allItems]
  );

  // Handle input changes
  const handleInput = useCallback(
    (value: string, cursorPos: number) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const detection = detectTrigger(value, cursorPos);

      if (detection) {
        // Trigger detected - open autocomplete
        const filtered = filterItems(detection.query, detection.type);
        const pos = calculatePosition(textarea, cursorPos);

        setIsOpen(true);
        setQuery(detection.query);
        setType(detection.type);
        setPosition(pos);
        setItems(filtered);
        setSelectedIndex(0);
        setTriggerStart(detection.startPos);
      } else {
        // No trigger - close autocomplete
        setIsOpen(false);
      }
    },
    [textareaRef, filterItems, calculatePosition]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>): boolean => {
      if (!isOpen) return false;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
          return true;

        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          return true;

        case 'Enter':
          event.preventDefault();
          if (items[selectedIndex]) {
            handleSelect(items[selectedIndex]);
          }
          return true;

        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          return true;

        default:
          return false;
      }
    },
    [isOpen, items, selectedIndex]
  );

  // Handle item selection
  const handleSelect = useCallback(
    (item: AutocompleteItem) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const value = textarea.value;
      const cursorPos = textarea.selectionStart;

      // Find the trigger start position
      const detection = detectTrigger(value, cursorPos);
      if (!detection) return;

      // Determine the closing syntax based on type
      let insertText: string;
      let closingSyntax: string;

      switch (type) {
        case 'page':
          insertText = item.title;
          closingSyntax = ']]';
          break;
        case 'block':
          insertText = item.id === '__create__' ? item.title : item.id;
          closingSyntax = '))';
          break;
        case 'tag':
          // For tags with spaces, use #[[ ]]
          if (item.title.includes(' ')) {
            insertText = item.title;
            closingSyntax = ']]';
          } else {
            insertText = item.title;
            closingSyntax = '';
          }
          break;
      }

      // Calculate positions for replacement
      const beforeTrigger = value.substring(0, detection.startPos);
      const afterCursor = value.substring(cursorPos);

      // Build new value
      const newValue = beforeTrigger + insertText + closingSyntax + afterCursor;
      const newCursorPos = detection.startPos + insertText.length + closingSyntax.length;

      // Update textarea
      textarea.value = newValue;
      textarea.setSelectionRange(newCursorPos, newCursorPos);

      // Call onInsert callback if provided
      if (onInsert) {
        onInsert(newValue);
      }

      // Close autocomplete
      setIsOpen(false);
    },
    [textareaRef, type, onInsert]
  );

  // Close autocomplete
  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    query,
    type,
    position,
    selectedIndex,
    items,
    handleKeyDown,
    handleInput,
    handleSelect,
    close,
  };
};
