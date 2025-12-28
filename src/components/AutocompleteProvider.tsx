/**
 * Autocomplete context provider for managing completable items across the app
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useBlockStore } from '../store/store';
import type { AutocompleteItem } from './Autocomplete';

export interface AutocompleteContextValue {
  items: AutocompleteItem[];
  registerItems: (items: AutocompleteItem[]) => void;
  unregisterItems: (ids: string[]) => void;
  search: (query: string, type: 'page' | 'block' | 'tag') => AutocompleteItem[];
}

const AutocompleteContext = createContext<AutocompleteContextValue | null>(null);

/**
 * Hook to access autocomplete context
 */
export const useAutocompleteContext = () => {
  const context = useContext(AutocompleteContext);
  if (!context) {
    throw new Error('useAutocompleteContext must be used within AutocompleteProvider');
  }
  return context;
};

export interface AutocompleteProviderProps {
  children: React.ReactNode;
}

/**
 * Provider for autocomplete functionality
 * - Provides list of pages and blocks for autocomplete
 * - Gets pages from useBlockStore
 * - Allows registering/unregistering completable items
 * - Provides search function using Fuse.js
 */
export const AutocompleteProvider = ({ children }: AutocompleteProviderProps) => {
  // Get pages and blocks from store
  const pages = useBlockStore((state) => state.pages);
  const blocks = useBlockStore((state) => state.blocks);

  // Additional registered items (for custom completables)
  const [customItems, setCustomItems] = useState<AutocompleteItem[]>([]);

  // Convert store pages to autocomplete items
  const pageItems = useMemo((): AutocompleteItem[] => {
    return Array.from(pages.values()).map((page) => ({
      id: page.id,
      title: page.name,
      type: 'page' as const,
    }));
  }, [pages]);

  // Convert store blocks to autocomplete items
  const blockItems = useMemo((): AutocompleteItem[] => {
    return Array.from(blocks.values()).map((block) => ({
      id: block.id,
      // Use first 50 chars of content as title
      title: block.content.substring(0, 50) + (block.content.length > 50 ? '...' : ''),
      type: 'block' as const,
    }));
  }, [blocks]);

  // Extract tags from pages and blocks
  const tagItems = useMemo((): AutocompleteItem[] => {
    const tags = new Set<string>();

    // Extract tags from page names
    Array.from(pages.values()).forEach((page) => {
      // Check if page has tag property
      if (page.properties?.tags) {
        const pageTags = Array.isArray(page.properties.tags)
          ? page.properties.tags
          : [page.properties.tags];
        pageTags.forEach((tag) => tags.add(String(tag)));
      }
    });

    // Extract tags from block content (simple regex match for #tags)
    Array.from(blocks.values()).forEach((block) => {
      const tagMatches = block.content.matchAll(/#([a-zA-Z0-9_-]+)/g);
      for (const match of tagMatches) {
        tags.add(match[1]);
      }
      // Also match #[[ ]] style tags
      const bracketTagMatches = block.content.matchAll(/#\[\[([^\]]+)\]\]/g);
      for (const match of bracketTagMatches) {
        tags.add(match[1]);
      }
    });

    return Array.from(tags).map((tag) => ({
      id: `tag-${tag}`,
      title: tag,
      type: 'tag' as const,
    }));
  }, [pages, blocks]);

  // Combine all items
  const allItems = useMemo(() => {
    return [...pageItems, ...blockItems, ...tagItems, ...customItems];
  }, [pageItems, blockItems, tagItems, customItems]);

  // Fuse.js instances for search
  const fuseInstances = useMemo(() => {
    const pagesFuse = new Fuse(
      allItems.filter((item) => item.type === 'page'),
      {
        keys: ['title'],
        threshold: 0.4,
      }
    );

    const blocksFuse = new Fuse(
      allItems.filter((item) => item.type === 'block'),
      {
        keys: ['title'],
        threshold: 0.4,
      }
    );

    const tagsFuse = new Fuse(
      allItems.filter((item) => item.type === 'tag'),
      {
        keys: ['title'],
        threshold: 0.4,
      }
    );

    return {
      page: pagesFuse,
      block: blocksFuse,
      tag: tagsFuse,
    };
  }, [allItems]);

  // Register custom items
  const registerItems = useCallback((items: AutocompleteItem[]) => {
    setCustomItems((prev) => {
      // Remove duplicates by id
      const existing = new Map(prev.map((item) => [item.id, item]));
      items.forEach((item) => existing.set(item.id, item));
      return Array.from(existing.values());
    });
  }, []);

  // Unregister custom items
  const unregisterItems = useCallback((ids: string[]) => {
    setCustomItems((prev) => prev.filter((item) => !ids.includes(item.id)));
  }, []);

  // Search function
  const search = useCallback(
    (query: string, type: 'page' | 'block' | 'tag'): AutocompleteItem[] => {
      const fuse = fuseInstances[type];

      if (!query || !query.trim()) {
        // Return all items of this type (limited to 10)
        return allItems.filter((item) => item.type === type).slice(0, 10);
      }

      // Use Fuse.js for fuzzy search
      const results = fuse.search(query);
      return results.map((result) => result.item).slice(0, 10);
    },
    [fuseInstances, allItems]
  );

  const contextValue = useMemo(
    () => ({
      items: allItems,
      registerItems,
      unregisterItems,
      search,
    }),
    [allItems, registerItems, unregisterItems, search]
  );

  return (
    <AutocompleteContext.Provider value={contextValue}>
      {children}
    </AutocompleteContext.Provider>
  );
};
