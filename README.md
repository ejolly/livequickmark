# Live Quick Mark

*fork extracting Logseq's frontend editor for personal use*

A powerful outliner-based markdown editor library with bi-directional linking, tags, and full markdown support. Built with React, TypeScript, and the mldoc parser.

## Features

- **Block-based Hierarchical Structure** - Organize content in nested blocks like Logseq and Workflowy
- **Full Markdown Support** - Complete markdown syntax powered by the mldoc parser
- **Bi-directional Links** - Page references `[[page]]` and block references `((uuid))`
- **Tag Support** - Organize with `#tags` and `#[[multi-word tags]]`
- **Inline Editing** - Seamless editing experience with keyboard shortcuts
- **Collapse/Expand** - Hierarchical navigation with collapsible blocks
- **Pluggable Storage** - Swap storage backends (memory, IndexedDB, etc.)
- **Type-safe** - Full TypeScript support with comprehensive type definitions
- **Renderer Components** - Display markdown content with interactive elements
- **Dark Mode Ready** - Built-in dark mode support with Tailwind CSS

## Installation

```bash
npm install live-quick-mark
```

Or with yarn:

```bash
yarn add live-quick-mark
```

Or with pnpm:

```bash
pnpm add live-quick-mark
```

## Quick Start

### Basic Usage

```typescript
import { Outliner, useBlockStore, createMemoryAdapter } from 'live-quick-mark';
import 'live-quick-mark/styles';

function MyApp() {
  const { setAdapter, createPage, currentPageId } = useBlockStore();

  useEffect(() => {
    // Initialize storage adapter
    const adapter = createMemoryAdapter();
    setAdapter(adapter);

    // Create a page
    createPage('My First Page').then(page => {
      setCurrentPage(page.id);
    });
  }, []);

  return (
    <div>
      {currentPageId && (
        <Outliner pageId={currentPageId} mode="edit" />
      )}
    </div>
  );
}
```

### Rendering Markdown

```typescript
import { Renderer } from 'live-quick-mark';

function MarkdownViewer() {
  return (
    <Renderer
      content="# Hello [[World]]\n\nThis is **bold** text with a #tag"
      onPageClick={(page) => console.log('Navigate to:', page)}
      onTagClick={(tag) => console.log('Filter by:', tag)}
    />
  );
}
```

### Using the Block Editor

```typescript
import { BlockEditor } from 'live-quick-mark';

function MyBlockEditor({ block }) {
  return (
    <BlockEditor
      block={block}
      autoFocus
      onCreateBlock={(afterId) => console.log('Create block after:', afterId)}
      onDeleteBlock={(id) => console.log('Delete block:', id)}
      onIndent={(id) => console.log('Indent:', id)}
      onOutdent={(id) => console.log('Outdent:', id)}
    />
  );
}
```

## API Documentation

### Components

#### `<Outliner />`

Displays a hierarchical tree of blocks with editing capabilities.

**Props:**
- `pageId: string` - The page ID to display blocks for
- `className?: string` - Optional CSS class name
- `mode?: 'read' | 'edit'` - Display mode (default: 'edit')

**Example:**
```typescript
<Outliner pageId="page-123" mode="edit" />
```

#### `<BlockEditor />`

Inline editor for a single block with keyboard shortcuts.

**Props:**
- `block: Block` - The block to edit
- `autoFocus?: boolean` - Whether to auto-focus on mount
- `onCreateBlock?: (afterBlockId: string) => void` - Callback for Enter key
- `onDeleteBlock?: (blockId: string) => void` - Callback for Backspace on empty
- `onIndent?: (blockId: string) => void` - Callback for Tab key
- `onOutdent?: (blockId: string) => void` - Callback for Shift+Tab
- `onFocusPrevious?: (blockId: string) => void` - Callback for ArrowUp
- `onFocusNext?: (blockId: string) => void` - Callback for ArrowDown
- `className?: string` - Optional CSS class name

**Keyboard Shortcuts:**
- `Enter` - Create new block below
- `Backspace` (on empty) - Delete block
- `Tab` - Indent block
- `Shift+Tab` - Outdent block
- `ArrowUp` (at start) - Focus previous block
- `ArrowDown` (at end) - Focus next block

#### `<Renderer />`

Renders markdown content to React elements.

**Props:**
- `content: string` - The markdown content to render
- `config?: Partial<ParserConfig>` - Parser configuration
- `onPageClick?: (pageName: string) => void` - Callback for page reference clicks
- `onBlockClick?: (blockId: string) => void` - Callback for block reference clicks
- `onTagClick?: (tag: string) => void` - Callback for tag clicks
- `onCheckboxChange?: (checked: boolean, itemIndex: number[]) => void` - Callback for checkbox changes
- `className?: string` - Optional CSS class name
- `style?: React.CSSProperties` - Optional inline styles

**Example:**
```typescript
<Renderer
  content="# Hello [[World]]\n- [ ] Task"
  onPageClick={(page) => navigateTo(page)}
  onCheckboxChange={(checked, path) => updateTask(path, checked)}
/>
```

### Store

#### `useBlockStore()`

Zustand store hook for managing blocks and pages.

**State:**
- `blocks: Map<string, Block>` - All blocks
- `pages: Map<string, Page>` - All pages
- `currentPageId: string | null` - Currently active page
- `zoomedBlockId: string | null` - Currently zoomed block
- `focusedBlockId: string | null` - Currently focused block
- `selectedBlockIds: Set<string>` - Currently selected blocks

**Actions:**

**Block Operations:**
- `createBlock(block: Partial<Block>): Promise<Block>` - Create a new block
- `updateBlock(id: string, updates: Partial<Block>): Promise<void>` - Update a block
- `deleteBlock(id: string): Promise<void>` - Delete a block
- `moveBlock(blockId: string, newParentId: string | null, newOrder: number): Promise<void>` - Move a block
- `indentBlock(blockId: string): Promise<void>` - Indent a block (make it child of previous sibling)
- `outdentBlock(blockId: string): Promise<void>` - Outdent a block (move to parent's level)
- `toggleCollapse(blockId: string): Promise<void>` - Toggle block collapse state

**Page Operations:**
- `createPage(name: string, properties?: Record<string, unknown>): Promise<Page>` - Create a new page
- `updatePage(id: string, updates: Partial<Page>): Promise<void>` - Update a page
- `deletePage(id: string): Promise<void>` - Delete a page

**Navigation:**
- `setCurrentPage(pageId: string | null): void` - Set the current page
- `zoomToBlock(blockId: string | null): void` - Zoom into a block
- `focusBlock(blockId: string | null): void` - Focus a block
- `selectBlocks(blockIds: string[]): void` - Select multiple blocks
- `clearSelection(): void` - Clear block selection

**Queries:**
- `getBlock(id: string): Block | null` - Get a block by ID
- `getPage(id: string): Page | null` - Get a page by ID
- `getPageBlocks(pageId: string): Block[]` - Get all blocks for a page
- `getChildren(blockId: string): Block[]` - Get child blocks
- `getParent(blockId: string): Block | null` - Get parent block
- `getSiblings(blockId: string): Block[]` - Get sibling blocks

**Example:**
```typescript
const { createBlock, updateBlock, focusBlock } = useBlockStore();

// Create a block
const block = await createBlock({
  pageId: 'page-123',
  content: 'Hello world',
  parentId: null,
  order: 0,
});

// Update it
await updateBlock(block.id, {
  content: 'Updated content'
});

// Focus it
focusBlock(block.id);
```

#### `createMemoryAdapter()`

Creates an in-memory storage adapter for development and testing.

**Example:**
```typescript
const adapter = createMemoryAdapter();
useBlockStore.getState().setAdapter(adapter);
```

### Types

#### `Block`

```typescript
interface Block {
  id: string;
  content: string;
  pageId?: string;
  parentId: string | null;
  children: string[];
  collapsed: boolean;
  createdAt: string;
  updatedAt: string;
  order?: number;
  properties?: Record<string, unknown>;
}
```

#### `Page`

```typescript
interface Page {
  id: string;
  name: string;
  blockIds: string[];
  properties?: Record<string, unknown>;
  createdAt: number;
  updatedAt: number;
}
```

#### `StorageAdapter`

```typescript
interface StorageAdapter {
  getBlock(id: string): Promise<Block | null>;
  saveBlock(block: Block): Promise<void>;
  deleteBlock(id: string): Promise<void>;
  getPage(id: string): Promise<Page | null>;
  getAllPages(): Promise<Page[]>;
  savePage(page: Page): Promise<void>;
  deletePage(id: string): Promise<void>;
  getBlocks(ids: string[]): Promise<Map<string, Block>>;
  saveBlocks(blocks: Block[]): Promise<void>;
  getPageBlocks(pageId: string): Promise<Block[]>;
  getChildBlocks(parentId: string): Promise<Block[]>;
}
```

### Utilities

#### Link Detection

```typescript
// Page references
import { isPageRef, createPageRef, getPageName, extractAllPageRefs } from 'live-quick-mark';

isPageRef('[[My Page]]'); // true
createPageRef('My Page'); // '[[My Page]]'
getPageName('[[My Page]]'); // 'My Page'
extractAllPageRefs('See [[Page 1]] and [[Page 2]]'); // ['Page 1', 'Page 2']

// Block references
import { isBlockRef, createBlockRef, getBlockRefId, extractAllBlockRefs } from 'live-quick-mark';

// Tags
import { isTag, createTag, getTagName, extractAllTags } from 'live-quick-mark';

// Real-time detection
import { detectTrigger } from 'live-quick-mark';

const detection = detectTrigger('Hello [[wor', 9); // Position at 'r'
if (detection) {
  console.log(detection.type); // 'page-ref'
  console.log(detection.query); // 'wor'
  console.log(detection.range); // { start: 6, end: 11 }
}
```

#### Parser

```typescript
import { parseContent, parseBlock, getDefaultConfig } from 'live-quick-mark';

// Parse multiple blocks
const blocks = parseContent('# Heading\n\nParagraph');

// Parse single block
const block = parseBlock('**Bold** text');

// Get default config
const config = getDefaultConfig();
```

## Development

### Running the Demo

```bash
# Clone the repository
git clone https://github.com/logseq/logseq.git
cd logseq

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Visit `http://localhost:5173` to see the demo app.

### Building the Library

```bash
# Build for production
npm run build:lib

# The built files will be in the dist/ directory
```

### Project Structure

```
src/
├── components/          # React components
│   ├── Outliner.tsx    # Main outliner component
│   └── BlockEditor.tsx # Block editor component
├── renderer/           # Markdown renderer
│   ├── index.tsx       # Main renderer
│   ├── BlockRenderer.tsx
│   └── InlineRenderer.tsx
├── store/              # Zustand store
│   ├── store.ts        # Store implementation
│   ├── types.ts        # Store types
│   └── memory-adapter.ts
├── parser/             # mldoc parser wrapper
│   ├── index.ts
│   └── config.ts
├── links/              # Link detection utilities
│   ├── page-ref.ts
│   ├── block-ref.ts
│   ├── tag.ts
│   └── detect.ts
├── types/              # TypeScript types
│   ├── ast.ts          # AST types
│   ├── block.ts        # Block types
│   └── index.ts
├── App.tsx             # Demo application
├── main.tsx            # Demo entry point
└── index.ts            # Library entry point
```

## Advanced Usage

### Custom Storage Adapter

Implement your own storage backend:

```typescript
import type { StorageAdapter, Block, Page } from 'live-quick-mark';

class IndexedDBAdapter implements StorageAdapter {
  async getBlock(id: string): Promise<Block | null> {
    // Your implementation
  }

  async saveBlock(block: Block): Promise<void> {
    // Your implementation
  }

  // ... implement other methods
}

// Use it
const adapter = new IndexedDBAdapter();
useBlockStore.getState().setAdapter(adapter);
```

### Custom Parser Configuration

```typescript
import { Renderer, getDefaultConfig } from 'live-quick-mark';

const customConfig = {
  ...getDefaultConfig(),
  format: 'markdown' as const,
  parseHeading: true,
  parseList: true,
  // ... other options
};

<Renderer content={markdown} config={customConfig} />
```

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details

## Credits

Built with:
- [React](https://react.dev/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Zustand](https://github.com/pmndrs/zustand) - State management
- [mldoc](https://github.com/logseq/mldoc) - Markdown/Org parser
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Vite](https://vitejs.dev/) - Build tool

Inspired by:
- [Logseq](https://logseq.com/) - Outliner-based note-taking
- [Workflowy](https://workflowy.com/) - Simple outlining
- [Roam Research](https://roamresearch.com/) - Bi-directional linking

## Support

- Documentation: [Link to docs]
- Issues: [GitHub Issues](https://github.com/logseq/logseq/issues)
- Discussions: [GitHub Discussions](https://github.com/logseq/logseq/discussions)
