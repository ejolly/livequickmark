# Live-Quick-Mark Renderer

AST-to-React renderer for the live-quick-mark markdown editor library. Renders parsed markdown content using mldoc AST to React components.

## Overview

This renderer takes markdown content parsed by mldoc and renders it to React components with support for:

- **Inline elements**: Plain text, emphasis (bold, italic, underline, strikethrough, highlight), links, tags, code, macros, sub/superscript
- **Block elements**: Paragraphs, headings, lists (ordered, unordered, checkboxes), code blocks, quotes, tables, horizontal rules
- **Logseq-specific features**: Page references `[[page]]`, block references `((uuid))`, tags `#tag`

## Installation

```bash
npm install mldoc react react-dom
```

## Usage

### Basic Example

```tsx
import { Renderer } from './renderer';

function App() {
  const content = `
# Hello World

This is **bold** and this is *italic*.

- Item 1
- Item 2
  - Nested item

Check out [[My Page]] and ((block-uuid)).
`;

  return (
    <Renderer
      content={content}
      onPageClick={(page) => console.log('Navigate to:', page)}
      onBlockClick={(id) => console.log('Show block:', id)}
      onTagClick={(tag) => console.log('Filter by tag:', tag)}
    />
  );
}
```

### With Custom Configuration

```tsx
import { Renderer } from './renderer';

function App() {
  const config = {
    format: 'Markdown' as const,
    keep_line_break: true,
    toc: false,
  };

  return (
    <Renderer
      content="# Hello\n\nWorld"
      config={config}
      className="my-custom-renderer"
      style={{ maxWidth: '800px' }}
    />
  );
}
```

### With All Callbacks

```tsx
import { Renderer } from './renderer';

function App() {
  const handlePageClick = (pageName: string) => {
    // Navigate to page
    router.push(`/page/${pageName}`);
  };

  const handleBlockClick = (blockId: string) => {
    // Scroll to or highlight block
    document.getElementById(blockId)?.scrollIntoView();
  };

  const handleTagClick = (tag: string) => {
    // Filter content by tag
    setFilter({ tag });
  };

  const handleCheckboxChange = (checked: boolean, itemPath: number[]) => {
    // Update task status
    updateBlock(itemPath, { status: checked ? 'DONE' : 'TODO' });
  };

  return (
    <Renderer
      content={markdownContent}
      onPageClick={handlePageClick}
      onBlockClick={handleBlockClick}
      onTagClick={handleTagClick}
      onCheckboxChange={handleCheckboxChange}
    />
  );
}
```

## Components

### Renderer (Main Component)

The main component that orchestrates parsing and rendering.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `content` | `string` | Markdown/Org content to render |
| `config` | `Partial<ParserConfig>` | Parser configuration options |
| `onPageClick` | `(pageName: string) => void` | Callback when page reference clicked |
| `onBlockClick` | `(blockId: string) => void` | Callback when block reference clicked |
| `onTagClick` | `(tag: string) => void` | Callback when tag clicked |
| `onCheckboxChange` | `(checked: boolean, path: number[]) => void` | Callback when checkbox toggled |
| `className` | `string` | CSS class for container (default: `'lqm-renderer'`) |
| `style` | `React.CSSProperties` | Inline styles for container |

### BlockRenderer

Renders block-level AST elements (paragraphs, headings, lists, etc.).

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `blocks` | `BlockAst[]` | Array of block AST nodes |
| `callbacks` | `RendererCallbacks` | Callback functions |

**Supported Block Types:**

- `Paragraph` - Text paragraphs
- `Heading` - Headings (h1-h6) with markers, priorities, and tags
- `List` - Ordered/unordered lists with optional checkboxes
- `Src` - Code blocks with language labels
- `Quote` - Blockquotes
- `Table` - Tables with headers and rows
- `Horizontal_Rule` - Horizontal dividers
- `Drawer` - Org-mode drawers
- `Property_Drawer` - Org-mode property drawers
- `Latex_Fragment` - LaTeX blocks
- `Footnote_Definition` - Footnote definitions
- `Custom`, `Hiccup`, `Raw_Html` - Special block types

### InlineRenderer

Renders inline AST elements (text formatting, links, etc.).

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `ast` | `InlineAst[]` | Array of inline AST nodes |
| `callbacks` | `RendererCallbacks` | Callback functions |

**Supported Inline Types:**

- `Plain` - Plain text
- `Emphasis` - Bold, italic, underline, strikethrough, highlight
- `Link` - Links with types: Page_ref, Block_ref, Complex, File, Embed_data
- `Nested_link` - Wiki-links `[[page]]`
- `Tag` - Tags `#tag`
- `Code` - Inline code
- `Verbatim` - Verbatim text
- `Macro` - Macros `{{name arg}}`
- `Subscript` - Subscript text
- `Superscript` - Superscript text
- `Timestamp`, `Email`, `Cookie`, `Footnote_Reference` - Special inline types

## CSS Classes

The renderer uses semantic CSS classes for styling. Import the included `styles.css` or customize your own:

```tsx
import './renderer/styles.css';
```

### Block-level Classes

- `.lqm-paragraph` - Paragraphs
- `.lqm-heading`, `.lqm-heading-1` through `.lqm-heading-6` - Headings
- `.lqm-list`, `.lqm-ordered-list`, `.lqm-unordered-list` - Lists
- `.lqm-checkbox-item`, `.lqm-checkbox` - Checkbox items
- `.lqm-code-block-wrapper`, `.lqm-code-block`, `.lqm-code-block-language` - Code blocks
- `.lqm-blockquote` - Blockquotes
- `.lqm-table`, `.lqm-table-row`, `.lqm-table-cell`, `.lqm-table-header-cell` - Tables
- `.lqm-hr` - Horizontal rules

### Inline Classes

- `.lqm-bold`, `.lqm-italic`, `.lqm-underline`, `.lqm-strikethrough`, `.lqm-highlight` - Text formatting
- `.lqm-page-ref` - Page references `[[page]]`
- `.lqm-block-ref` - Block references `((uuid))`
- `.lqm-tag` - Tags `#tag`
- `.lqm-inline-code`, `.lqm-verbatim` - Inline code
- `.lqm-macro` - Macros
- `.lqm-external-link`, `.lqm-file-link` - Links

## Parser Configuration

The `config` prop accepts these options:

```typescript
interface ParserConfig {
  /** Generate table of contents (default: false) */
  toc?: boolean;

  /** Add heading numbers (default: false) */
  heading_number?: boolean;

  /** Preserve line breaks (default: true) */
  keep_line_break?: boolean;

  /** Input format (default: 'Markdown') */
  format?: 'Markdown' | 'Org';

  /** Convert headings to lists (default: false) */
  heading_to_list?: boolean;

  /** Parse only outline (default: false) */
  parse_outline_only?: boolean;
}
```

## Type Definitions

All TypeScript types are exported from `../types`:

```typescript
import type {
  BlockAst,
  InlineAst,
  ParsedBlock,
  ParserConfig,
  RendererCallbacks,
} from '../types';
```

## Examples

### Rendering Different Content Types

```tsx
// Markdown with wiki-links
<Renderer content="Check [[My Page]] for details" />

// Org-mode
<Renderer
  content="* TODO Task [#A]\n- Item 1"
  config={{ format: 'Org' }}
/>

// Code block
<Renderer content={'```javascript\nconsole.log("Hello");\n```'} />

// Table
<Renderer content={`
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`} />
```

### Custom Styling

```tsx
<Renderer
  content={content}
  className="custom-markdown"
  style={{
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#fff',
  }}
/>
```

```css
/* Custom styles */
.custom-markdown .lqm-heading-1 {
  color: #2196f3;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 0.5rem;
}

.custom-markdown .lqm-page-ref {
  color: #9c27b0;
  background-color: #f3e5f5;
  padding: 0.125rem 0.5rem;
  border-radius: 4px;
}
```

## Architecture

```
renderer/
├── index.tsx          # Main Renderer component
├── BlockRenderer.tsx  # Block-level rendering
├── InlineRenderer.tsx # Inline rendering
├── styles.css         # Default styles
└── README.md          # This file
```

The renderer follows a top-down architecture:

1. **Renderer** - Parses content using mldoc parser
2. **BlockRenderer** - Handles block-level AST nodes
3. **InlineRenderer** - Handles inline AST nodes within blocks

## Browser Support

Requires React 18+ and modern browsers with ES2022 support.

## License

Same as parent project.
