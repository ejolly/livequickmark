# Logseq Markdown Editor Extraction Guide

A comprehensive guide to extracting Logseq's live markdown editing experience into a reusable library.

## Executive Summary

Logseq's front-end markdown editing is built on:
1. **mldoc** - An OCaml-based Markdown/Org-mode parser compiled to JavaScript
2. **React** (via ClojureScript's Rum) for UI components
3. **Block-based editing** with a tree structure
4. **Real-time reactive rendering** (no separate preview pane)
5. **Custom wiki-linking syntax** (`[[page refs]]` and `((block refs))`)

---

## Part 1: Core Dependencies

### Essential NPM Packages

```json
{
  "dependencies": {
    "mldoc": "^1.5.9",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-textarea-autosize": "^8.3.3",
    "codemirror": "^5.65.18",
    "marked": "^5.1.2",
    "katex": "^0.16.10",
    "dompurify": "^2.4.0",
    "fuse.js": "^6.4.6",
    "grapheme-splitter": "^1.0.4"
  }
}
```

### What Each Does

| Package | Purpose |
|---------|---------|
| **mldoc** | Core parser - converts Markdown/Org to AST (JSON) |
| **react-textarea-autosize** | Auto-expanding input for block editing |
| **codemirror** | Code block syntax highlighting |
| **marked** | Secondary markdown renderer for HTML export |
| **katex** | LaTeX math rendering |
| **dompurify** | HTML sanitization for security |
| **fuse.js** | Fuzzy search for page/block autocomplete |
| **grapheme-splitter** | Unicode-aware cursor positioning |

---

## Part 2: The mldoc Parser

### Basic Usage (JavaScript)

```javascript
import { Mldoc } from 'mldoc';

// Parse markdown to AST
const content = "# Hello [[World]]\nThis is a **test** with ((block-ref))";
const config = JSON.stringify({
  toc: false,
  heading_number: false,
  keep_line_break: true,
  format: "Markdown",
  heading_to_list: false
});

const ast = JSON.parse(Mldoc.parseJson(content, config));
```

### AST Structure

The parser outputs an array of `[block, position]` tuples:

```javascript
// Input: "# Hello [[World]]"
// Output:
[
  [
    ["Heading", {
      "title": [
        ["Plain", "Hello "],
        ["Nested_link", { "content": "World" }]
      ],
      "level": 1
    }],
    { "start_pos": 0, "end_pos": 17 }
  ]
]
```

### Key AST Node Types

**Block-level:**
- `Paragraph` - Text paragraphs
- `Heading` - Headers with level, title, tags
- `List` - Ordered/unordered lists with checkboxes
- `Src` - Code blocks with language
- `Quote` - Blockquotes
- `Table` - Tables

**Inline:**
- `Plain` - Plain text
- `Emphasis` - Bold, italic, underline, strikethrough, highlight
- `Link` - URLs with types: `Page_ref`, `Block_ref`, `Search`, `Complex`
- `Nested_link` - Wiki-links `[[...]]`
- `Tag` - Hashtags `#tag`
- `Macro` - Template macros `{{macro arg}}`
- `Code` - Inline code

---

## Part 3: Wiki-Link Detection

### Page Reference Regex

```javascript
// From: logseq/common/util/page_ref.cljs

// Basic page ref - inner capture, no nested brackets
const PAGE_REF_RE = /\[\[(.*?)\]\]/;

// Most inner nested brackets (handles [[nested [[links]]]])
const PAGE_REF_WITHOUT_NESTED_RE = /\[\[([^\[\]]+)\]\]/;

// Captures everything between brackets
const PAGE_REF_ANY_RE = /\[\[(.*)\]\]/;

// Utility functions
function isPageRef(s) {
  return s.startsWith('[[') && s.endsWith(']]');
}

function createPageRef(pageName) {
  return `[[${pageName}]]`;
}

function getPageName(s) {
  const match = s.match(PAGE_REF_ANY_RE);
  return match ? match[1] : null;
}
```

### Block Reference Regex

```javascript
// From: logseq/common/util/block_ref.cljs

// UUID format: ((xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx))
const BLOCK_REF_RE = /\(\(([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})\)\)/;

function isBlockRef(s) {
  return BLOCK_REF_RE.test(s);
}

function createBlockRef(uuid) {
  return `((${uuid}))`;
}

function getBlockRefId(s) {
  const match = s.match(BLOCK_REF_RE);
  return match ? match[1] : null;
}
```

---

## Part 4: Editor Architecture

### Core Pattern: Block-Based Editing

Logseq uses a **block-tree** structure where:
1. Each block is an atomic editable unit
2. Blocks can have parent-child relationships (nesting)
3. Pressing Enter splits/creates blocks
4. Tab/Shift+Tab indents/outdents

### Minimal Block Editor Component (React)

```jsx
import React, { useRef, useState, useCallback } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import { Mldoc } from 'mldoc';

// Parse and render AST to React elements
function renderAst(ast) {
  return ast.map(([node, pos], idx) => {
    const [type, data] = node;

    switch (type) {
      case 'Paragraph':
        return <p key={idx}>{renderInline(data)}</p>;
      case 'Heading':
        const Tag = `h${data.level}`;
        return <Tag key={idx}>{renderInline(data.title)}</Tag>;
      case 'List':
        return renderList(data, idx);
      case 'Src':
        return <pre key={idx}><code className={`language-${data.language}`}>{data.lines.join('\n')}</code></pre>;
      case 'Quote':
        return <blockquote key={idx}>{data.map(([d]) => renderAst([[d, null]]))}</blockquote>;
      default:
        return null;
    }
  });
}

function renderInline(inlines) {
  if (!Array.isArray(inlines)) return null;

  return inlines.map(([type, data], idx) => {
    switch (type) {
      case 'Plain':
        return <span key={idx}>{data}</span>;
      case 'Emphasis':
        return renderEmphasis(data, idx);
      case 'Nested_link':
        return <a key={idx} href={`#${data.content}`} className="page-ref">[[{data.content}]]</a>;
      case 'Link':
        return renderLink(data, idx);
      case 'Tag':
        return <span key={idx} className="tag">#{renderInline(data)}</span>;
      case 'Code':
        return <code key={idx}>{data}</code>;
      default:
        return null;
    }
  });
}

function renderEmphasis([emphType, content], idx) {
  const wrappers = {
    'Bold': 'strong',
    'Italic': 'em',
    'Underline': 'u',
    'Strike_through': 's',
    'Highlight': 'mark'
  };
  const Tag = wrappers[emphType] || 'span';
  return <Tag key={idx}>{renderInline(content)}</Tag>;
}

function renderLink(data, idx) {
  const [urlType, urlValue] = data.url || [];

  if (urlType === 'Page_ref') {
    return <a key={idx} href={`#${urlValue}`} className="page-ref">[[{urlValue}]]</a>;
  }
  if (urlType === 'Block_ref') {
    return <span key={idx} className="block-ref">(({urlValue}))</span>;
  }
  if (urlType === 'Complex') {
    return <a key={idx} href={`${urlValue.protocol}://${urlValue.link}`}>{renderInline(data.label)}</a>;
  }
  return <span key={idx}>{data.full_text}</span>;
}

// Main Block Editor Component
export function BlockEditor({ initialContent = '', onSave }) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef(null);

  const config = JSON.stringify({
    toc: false,
    heading_number: false,
    keep_line_break: true,
    format: "Markdown"
  });

  const ast = React.useMemo(() => {
    try {
      return JSON.parse(Mldoc.parseJson(content, config));
    } catch (e) {
      return [];
    }
  }, [content]);

  const handleKeyDown = useCallback((e) => {
    // Enter without shift creates new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSave?.(content);
      // Parent component handles creating new block
    }
    // Escape exits editing
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  }, [content, onSave]);

  if (isEditing) {
    return (
      <TextareaAutosize
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setIsEditing(false);
          onSave?.(content);
        }}
        autoFocus
        className="block-editor-input"
      />
    );
  }

  return (
    <div
      className="block-editor-rendered"
      onClick={() => setIsEditing(true)}
    >
      {ast.length > 0 ? renderAst(ast) : <span className="placeholder">Click to edit...</span>}
    </div>
  );
}
```

---

## Part 5: Auto-Pair and Input Handling

### Autopair Map

```javascript
// From: logseq/handler/editor.cljs
const AUTOPAIR_MAP = {
  '[': ']',
  '(': ')',
  '{': '}',
  '`': '`',
  '~': '~',  // strikethrough
  '*': '*',  // bold
  '_': '_',  // italic
  '^': '^',  // superscript
  '=': '=',  // highlight
  '/': '/',
  '+': '+'
};

function handleAutopair(e, textareaEl) {
  const char = e.key;
  const closingChar = AUTOPAIR_MAP[char];

  if (closingChar) {
    const { selectionStart, selectionEnd, value } = textareaEl;
    const selectedText = value.substring(selectionStart, selectionEnd);

    if (selectedText) {
      // Wrap selection
      e.preventDefault();
      const newValue = value.substring(0, selectionStart) +
                       char + selectedText + closingChar +
                       value.substring(selectionEnd);
      textareaEl.value = newValue;
      textareaEl.setSelectionRange(selectionStart + 1, selectionEnd + 1);
    } else {
      // Insert pair
      e.preventDefault();
      const newValue = value.substring(0, selectionStart) +
                       char + closingChar +
                       value.substring(selectionEnd);
      textareaEl.value = newValue;
      textareaEl.setSelectionRange(selectionStart + 1, selectionStart + 1);
    }
  }
}
```

### Wiki-Link Trigger Detection

```javascript
function detectWikiLinkTrigger(value, cursorPos) {
  // Check if we just typed '[['
  const before = value.substring(Math.max(0, cursorPos - 2), cursorPos);
  if (before === '[[') {
    return { type: 'page', searchStart: cursorPos };
  }

  // Check if we just typed '(('
  if (before === '((') {
    return { type: 'block', searchStart: cursorPos };
  }

  // Check if we're inside an incomplete link
  const textBeforeCursor = value.substring(0, cursorPos);
  const lastOpenBracket = textBeforeCursor.lastIndexOf('[[');
  const lastCloseBracket = textBeforeCursor.lastIndexOf(']]');

  if (lastOpenBracket > lastCloseBracket) {
    const query = textBeforeCursor.substring(lastOpenBracket + 2);
    return { type: 'page', query, searchStart: lastOpenBracket + 2 };
  }

  return null;
}
```

---

## Part 6: Files to Extract

### Core Files for Extraction

```
deps/
├── common/src/logseq/common/util/
│   ├── page_ref.cljs      # Page reference utilities
│   └── block_ref.cljs     # Block reference utilities
├── graph-parser/src/logseq/graph_parser/
│   ├── mldoc.cljc         # mldoc wrapper
│   ├── schema/mldoc.cljc  # AST type definitions
│   └── block.cljs         # Block extraction logic

src/main/frontend/
├── components/
│   ├── editor.cljs        # Main editor component
│   └── block.cljs         # Block rendering (203KB - key file)
├── handler/
│   └── editor.cljs        # Editor event handling (174KB)
├── util/
│   └── cursor.cljs        # Cursor utilities
└── format/
    └── mldoc.cljs         # Frontend mldoc integration
```

### Key Functions to Port

1. **`mldoc.parseJson(content, config)`** - Parse content to AST
2. **`mldoc.parseInlineJson(text, config)`** - Parse inline elements only
3. **Block rendering pipeline** - AST → React components
4. **Cursor positioning** - Grapheme-aware cursor movement
5. **Wiki-link detection** - Real-time detection while typing
6. **Autopair insertion** - Smart bracket/formatting pairing

---

## Part 7: Minimal Library Architecture

### Recommended Structure

```
@your-org/markdown-editor/
├── src/
│   ├── parser/
│   │   ├── index.ts           # mldoc wrapper
│   │   ├── ast-types.ts       # TypeScript AST types
│   │   └── config.ts          # Parser configuration
│   ├── renderer/
│   │   ├── index.tsx          # Main renderer
│   │   ├── block-renderer.tsx # Block-level rendering
│   │   ├── inline-renderer.tsx# Inline element rendering
│   │   └── plugins/           # Extensible renderers
│   │       ├── code-block.tsx
│   │       ├── math.tsx
│   │       └── wiki-link.tsx
│   ├── editor/
│   │   ├── index.tsx          # Main editor component
│   │   ├── block-editor.tsx   # Single block editor
│   │   ├── tree-editor.tsx    # Full tree/outline editor
│   │   ├── hooks/
│   │   │   ├── use-cursor.ts
│   │   │   ├── use-autopair.ts
│   │   │   └── use-autocomplete.ts
│   │   └── utils/
│   │       ├── cursor.ts
│   │       └── selection.ts
│   ├── links/
│   │   ├── page-ref.ts        # Page reference utils
│   │   ├── block-ref.ts       # Block reference utils
│   │   └── detect.ts          # Link detection
│   └── index.ts               # Main exports
├── package.json
└── tsconfig.json
```

### TypeScript Type Definitions

```typescript
// ast-types.ts - Core AST types from mldoc schema

export type BlockAst =
  | ['Paragraph', InlineAst[]]
  | ['Heading', HeadingData]
  | ['List', ListData]
  | ['Src', SrcData]
  | ['Quote', BlockAst[]]
  | ['Table', TableData]
  | ['Drawer', DrawerData]
  | ['Property_Drawer', PropertyData]
  | ['Custom', string, string, string, string] // type, options, result, content
  | ['Hiccup', string]
  | ['Raw_Html', string]
  | ['Latex_Fragment', LatexData]
  | ['Horizontal_Rule']
  | ['Footnote_Definition', string, InlineAst[]];

export type InlineAst =
  | ['Plain', string]
  | ['Emphasis', [EmphasisType, InlineAst[]]]
  | ['Link', LinkData]
  | ['Nested_link', NestedLinkData]
  | ['Tag', InlineAst[]]
  | ['Code', string]
  | ['Verbatim', string]
  | ['Macro', MacroData]
  | ['Timestamp', TimestampData]
  | ['Subscript', InlineAst[]]
  | ['Superscript', InlineAst[]]
  | ['Latex_Fragment', string]
  | ['Inline_Html', string]
  | ['Email', EmailData]
  | ['Cookie', CookieData]
  | ['Footnote_Reference', FootnoteRefData];

export type EmphasisType =
  | 'Bold'
  | 'Italic'
  | 'Underline'
  | 'Strike_through'
  | 'Highlight';

export type LinkUrlType =
  | ['Page_ref', string]
  | ['Block_ref', string]
  | ['Search', string]
  | ['Complex', { protocol: string; link: string }]
  | ['File', string]
  | ['Embed_data', string];

export interface LinkData {
  url: LinkUrlType;
  label: InlineAst[];
  full_text: string;
}

export interface NestedLinkData {
  content: string;
  children?: InlineAst[];
}

export interface HeadingData {
  title: InlineAst[];
  level: number;
  tags?: string[];
  marker?: string;
  priority?: string;
}

export interface MacroData {
  name: string;
  arguments: string[];
}

export interface ParsedBlock {
  ast: BlockAst;
  pos: { start_pos: number; end_pos: number };
}

// Parser config
export interface ParserConfig {
  toc?: boolean;
  heading_number?: boolean;
  keep_line_break?: boolean;
  format?: 'Markdown' | 'Org';
  heading_to_list?: boolean;
  parse_outline_only?: boolean;
}
```

---

## Part 8: Implementation Checklist

### Phase 1: Core Parser Integration
- [ ] Install and configure mldoc
- [ ] Create TypeScript wrapper for mldoc API
- [ ] Define AST type definitions
- [ ] Write AST traversal utilities

### Phase 2: Basic Renderer
- [ ] Create block-level renderer (Paragraph, Heading, List, Code)
- [ ] Create inline renderer (Plain, Emphasis, Code)
- [ ] Add wiki-link rendering (`[[page]]`)
- [ ] Add block-ref rendering (`((uuid))`)
- [ ] Add tag rendering (`#tag`)

### Phase 3: Single-Block Editor
- [ ] Create textarea-based editor with auto-resize
- [ ] Implement autopair insertion
- [ ] Add real-time AST parsing
- [ ] Toggle between edit/preview modes

### Phase 4: Wiki-Link Autocomplete
- [ ] Detect `[[` trigger
- [ ] Fuzzy search pages (Fuse.js)
- [ ] Render autocomplete dropdown
- [ ] Insert completed link

### Phase 5: Advanced Features
- [ ] Block tree structure with nesting
- [ ] Block splitting on Enter
- [ ] Indent/outdent with Tab
- [ ] Cursor positioning (grapheme-aware)
- [ ] IME composition support
- [ ] CodeMirror for code blocks
- [ ] KaTeX for math rendering

### Phase 6: Polish
- [ ] CSS styling (Tailwind recommended)
- [ ] Keyboard shortcuts
- [ ] Mobile touch support
- [ ] Accessibility (ARIA)
- [ ] Performance optimization

---

## Part 9: Key Insights & Patterns

### 1. No Separate Preview
Logseq doesn't have a split editor/preview. Instead:
- Clicking a block switches to edit mode (textarea)
- Blurring switches back to rendered view
- This creates seamless WYSIWYG feel

### 2. Reactive State
Use React's `useMemo` to parse content only when it changes:
```jsx
const ast = useMemo(() => parseContent(content), [content]);
```

### 3. Block Identity
Each block needs a stable UUID for:
- Block references `((uuid))`
- Undo/redo history
- Sync/persistence

### 4. Cursor Mock Technique
For accurate cursor positioning in multi-line blocks:
- Create a hidden "mock" div with same styling
- Map character positions to visual coordinates
- Essential for up/down arrow navigation

### 5. Debounced Parsing
Don't parse on every keystroke:
```javascript
const debouncedParse = useDebouncedCallback(
  (content) => setAst(parse(content)),
  50
);
```

---

## Sources

- [mldoc on GitHub](https://github.com/logseq/mldoc)
- [mldoc on npm](https://www.npmjs.com/package/mldoc)
- [Logseq Source Code](https://github.com/logseq/logseq)

---

## Quick Start

```bash
# Create new project
mkdir my-markdown-editor && cd my-markdown-editor
npm init -y

# Install core dependencies
npm install mldoc react react-dom react-textarea-autosize
npm install -D typescript @types/react @types/react-dom vite

# Copy the BlockEditor component from Part 4
# Start building!
```
