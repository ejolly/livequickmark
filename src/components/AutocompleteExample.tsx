/**
 * Example usage of the Autocomplete system
 *
 * This demonstrates how to integrate the autocomplete components
 * into a markdown editor with wiki-link support.
 */

import { useRef, useState } from 'react';
import { AutocompleteProvider, useAutocompleteContext } from './AutocompleteProvider';
import { Autocomplete } from './Autocomplete';
import { useAutocomplete } from './useAutocomplete';

/**
 * Editor component that uses autocomplete
 */
const EditorWithAutocomplete = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null!);
  const [value, setValue] = useState('');
  const { items } = useAutocompleteContext();

  // Initialize autocomplete hook
  const autocomplete = useAutocomplete({
    allItems: items,
    textareaRef,
    onInsert: (newValue) => {
      setValue(newValue);
    },
  });

  // Handle textarea input
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    setValue(newValue);
    autocomplete.handleInput(newValue, cursorPos);
  };

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const handled = autocomplete.handleKeyDown(e);
    if (!handled) {
      // Handle other keyboard shortcuts here
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder="Try typing [[ for pages, (( for blocks, or # for tags..."
        style={{
          width: '100%',
          minHeight: '300px',
          padding: '12px',
          fontSize: '14px',
          fontFamily: 'monospace',
          border: '1px solid #ccc',
          borderRadius: '4px',
          resize: 'vertical',
        }}
      />

      {autocomplete.isOpen && (
        <Autocomplete
          items={autocomplete.items}
          selectedIndex={autocomplete.selectedIndex}
          onSelect={autocomplete.handleSelect}
          onClose={autocomplete.close}
          position={autocomplete.position}
          type={autocomplete.type}
          query={autocomplete.query}
        />
      )}
    </div>
  );
};

/**
 * App wrapper with AutocompleteProvider
 */
export const AutocompleteExample = () => {
  return (
    <AutocompleteProvider>
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <h1>Wiki-Link Autocomplete Demo</h1>
        <p>
          This demo shows how to use the autocomplete system for wiki-links:
        </p>
        <ul>
          <li><code>[[</code> - Page references (e.g., [[My Page]])</li>
          <li><code>((</code> - Block references (e.g., ((block-uuid)))</li>
          <li><code>#</code> - Tags (e.g., #todo or #[[multi word tag]])</li>
        </ul>
        <EditorWithAutocomplete />
      </div>
    </AutocompleteProvider>
  );
};

export default AutocompleteExample;
