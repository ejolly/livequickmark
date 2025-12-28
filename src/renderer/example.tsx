/**
 * Example usage of the live-quick-mark Renderer
 */

import { Renderer } from './index';
import './styles.css';

export function RendererExample() {
  const exampleContent = `
# Live Quick Mark Example

This is a demonstration of the **live-quick-mark** renderer.

## Text Formatting

You can use:
- **Bold text**
- *Italic text*
- ~~Strikethrough text~~
- ==Highlighted text==
- \`inline code\`

## Links and References

- Page links: [[My Page]] and [[Another Page]]
- Block references: ((65f4e8c0-1234-5678-9abc-def012345678))
- Tags: #important #todo #work
- External links: [Google](https://google.com)

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered List
1. First item
2. Second item
3. Third item

### Task List
- [ ] TODO: Incomplete task
- [x] DONE: Completed task
- [ ] Another task

## Code Blocks

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('World');
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

## Blockquotes

> This is a blockquote.
> It can span multiple lines.
>
> And have multiple paragraphs.

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Headings | ✅ | h1-h6 supported |
| Lists | ✅ | Ordered, unordered, checkboxes |
| Links | ✅ | Page refs, block refs, external |
| Code | ✅ | Inline and blocks |

## Special Elements

Subscript: H~2~O
Superscript: E = mc^2^

---

That's all for now!
`;

  const handlePageClick = (pageName: string) => {
    console.log('Navigate to page:', pageName);
    alert(`Would navigate to: ${pageName}`);
  };

  const handleBlockClick = (blockId: string) => {
    console.log('Show block:', blockId);
    alert(`Would show block: ${blockId}`);
  };

  const handleTagClick = (tag: string) => {
    console.log('Filter by tag:', tag);
    alert(`Would filter by tag: ${tag}`);
  };

  const handleCheckboxChange = (checked: boolean, itemPath: number[]) => {
    console.log('Checkbox changed:', { checked, itemPath });
    alert(`Task ${checked ? 'completed' : 'unchecked'} at path: ${itemPath.join(' > ')}`);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Live Quick Mark Renderer Demo</h1>
      <p>
        This demonstrates the AST-to-React renderer for markdown content.
        Click on page references, block references, or tags to see the callbacks in action.
      </p>

      <hr style={{ margin: '2rem 0' }} />

      <Renderer
        content={exampleContent}
        onPageClick={handlePageClick}
        onBlockClick={handleBlockClick}
        onTagClick={handleTagClick}
        onCheckboxChange={handleCheckboxChange}
        className="lqm-renderer"
      />
    </div>
  );
}

export default RendererExample;
