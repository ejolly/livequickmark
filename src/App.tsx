/**
 * Live Quick Mark Demo App
 *
 * A full-featured demo of the outliner-based markdown editor
 */

import { useEffect, useState } from 'react';
import { Outliner } from './components/Outliner';
import { useBlockStore, createMemoryAdapter } from './store';
import type { Page } from './store/types';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const {
    pages,
    currentPageId,
    setCurrentPage,
    createPage,
    createBlock,
    setAdapter,
    loadAllPages,
  } = useBlockStore();

  // Initialize store with sample data
  useEffect(() => {
    const initializeStore = async () => {
      // Create memory adapter
      const adapter = createMemoryAdapter();
      setAdapter(adapter);

      // Create sample pages and blocks
      const welcomePage = await createPage('Welcome to Live Quick Mark');
      const quickStartPage = await createPage('Quick Start Guide');
      const featuresPage = await createPage('Features');

      // Add blocks to Welcome page
      await createBlock({
        pageId: welcomePage.id,
        content: '# Welcome to Live Quick Mark',
        order: 0,
      });

      await createBlock({
        pageId: welcomePage.id,
        content: 'A powerful outliner-based markdown editor inspired by [[Logseq]] and [[Workflowy]].',
        order: 1,
      });

      const featuresBlock = await createBlock({
        pageId: welcomePage.id,
        content: '## Key Features',
        order: 2,
      });

      await createBlock({
        pageId: welcomePage.id,
        content: '**Hierarchical blocks** - Organize your thoughts in nested blocks',
        parentId: featuresBlock.id,
        order: 0,
      });

      await createBlock({
        pageId: welcomePage.id,
        content: '**Markdown support** - Full markdown syntax with live rendering',
        parentId: featuresBlock.id,
        order: 1,
      });

      await createBlock({
        pageId: welcomePage.id,
        content: '**Bi-directional links** - Use [[page]] and ((block-ref)) syntax',
        parentId: featuresBlock.id,
        order: 2,
      });

      await createBlock({
        pageId: welcomePage.id,
        content: '**Tags** - Organize with #tags',
        parentId: featuresBlock.id,
        order: 3,
      });

      const quickStartBlock = await createBlock({
        pageId: welcomePage.id,
        content: '## Getting Started',
        order: 3,
      });

      await createBlock({
        pageId: welcomePage.id,
        content: 'Click on any block to start editing',
        parentId: quickStartBlock.id,
        order: 0,
      });

      await createBlock({
        pageId: welcomePage.id,
        content: 'Press **Enter** to create a new block',
        parentId: quickStartBlock.id,
        order: 1,
      });

      await createBlock({
        pageId: welcomePage.id,
        content: 'Press **Tab** to indent, **Shift+Tab** to outdent',
        parentId: quickStartBlock.id,
        order: 2,
      });

      await createBlock({
        pageId: welcomePage.id,
        content: 'Use the sidebar to navigate between pages',
        parentId: quickStartBlock.id,
        order: 3,
      });

      // Add blocks to Quick Start page
      await createBlock({
        pageId: quickStartPage.id,
        content: '# Quick Start Guide',
        order: 0,
      });

      await createBlock({
        pageId: quickStartPage.id,
        content: 'This guide will help you get started with Live Quick Mark in just a few minutes.',
        order: 1,
      });

      const installBlock = await createBlock({
        pageId: quickStartPage.id,
        content: '## Installation',
        order: 2,
      });

      await createBlock({
        pageId: quickStartPage.id,
        content: '```bash\nnpm install live-quick-mark\n```',
        parentId: installBlock.id,
        order: 0,
      });

      const usageBlock = await createBlock({
        pageId: quickStartPage.id,
        content: '## Basic Usage',
        order: 3,
      });

      await createBlock({
        pageId: quickStartPage.id,
        content: 'Import the components you need',
        parentId: usageBlock.id,
        order: 0,
      });

      await createBlock({
        pageId: quickStartPage.id,
        content: '```typescript\nimport { Outliner, useBlockStore, createMemoryAdapter } from "live-quick-mark";\n```',
        parentId: usageBlock.id,
        order: 1,
      });

      // Add blocks to Features page
      await createBlock({
        pageId: featuresPage.id,
        content: '# Features Overview',
        order: 0,
      });

      const editorBlock = await createBlock({
        pageId: featuresPage.id,
        content: '## Block-based Editor',
        order: 1,
      });

      await createBlock({
        pageId: featuresPage.id,
        content: 'Every piece of content is a block',
        parentId: editorBlock.id,
        order: 0,
      });

      await createBlock({
        pageId: featuresPage.id,
        content: 'Blocks can be nested infinitely',
        parentId: editorBlock.id,
        order: 1,
      });

      await createBlock({
        pageId: featuresPage.id,
        content: 'Collapse/expand blocks for better organization',
        parentId: editorBlock.id,
        order: 2,
      });

      const markdownBlock = await createBlock({
        pageId: featuresPage.id,
        content: '## Markdown Support',
        order: 2,
      });

      await createBlock({
        pageId: featuresPage.id,
        content: '**Bold**, *italic*, ~~strikethrough~~, `code`',
        parentId: markdownBlock.id,
        order: 0,
      });

      await createBlock({
        pageId: featuresPage.id,
        content: 'Links: [External](https://example.com) and [[Internal Links]]',
        parentId: markdownBlock.id,
        order: 1,
      });

      await createBlock({
        pageId: featuresPage.id,
        content: 'Code blocks with syntax highlighting',
        parentId: markdownBlock.id,
        order: 2,
      });

      await createBlock({
        pageId: featuresPage.id,
        content: 'Tables, lists, quotes, and more',
        parentId: markdownBlock.id,
        order: 3,
      });

      // Load all pages and set current page
      await loadAllPages();
      setCurrentPage(welcomePage.id);
    };

    initializeStore().catch(console.error);
  }, []);

  const pagesList = Array.from(pages.values()).sort(
    (a, b) => a.createdAt - b.createdAt
  );

  const currentPage = currentPageId ? pages.get(currentPageId) : null;

  const handlePageClick = (page: Page) => {
    setCurrentPage(page.id);
  };

  const handleCreatePage = async () => {
    const pageName = prompt('Enter page name:');
    if (pageName) {
      const newPage = await createPage(pageName);
      setCurrentPage(newPage.id);
    }
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
        <div className="h-full px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Live Quick Mark
          </h1>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex pt-14 h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase">
                Pages
              </h2>
              <button
                onClick={handleCreatePage}
                className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                title="Create new page"
              >
                + New
              </button>
            </div>
            <nav className="space-y-1">
              {pagesList.map((page) => (
                <button
                  key={page.id}
                  onClick={() => handlePageClick(page)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    currentPageId === page.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {page.name}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main editor area */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto p-8">
            {currentPage ? (
              <>
                <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                  {currentPage.name}
                </h2>
                <Outliner
                  pageId={currentPage.id}
                  className="outliner-container"
                />
              </>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-20">
                <p className="text-lg">Select a page from the sidebar to get started</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
