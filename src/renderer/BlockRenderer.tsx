/**
 * BlockRenderer - Renders block-level AST elements
 * Handles paragraphs, headings, lists, quotes, code blocks, tables, etc.
 */

import React from 'react';
import { InlineRenderer } from './InlineRenderer';
import { CodeBlock } from '../components/CodeBlock';
import { MathBlock } from '../components/MathBlock';
import type {
  BlockAst,
  HeadingData,
  ListData,
  ListItem,
  SrcData,
  TableData,
  LatexData,
  RendererCallbacks,
} from '../types';

interface BlockRendererProps {
  blocks: BlockAst[];
  callbacks?: RendererCallbacks;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks, callbacks }) => {
  if (!Array.isArray(blocks)) {
    return null;
  }

  return (
    <>
      {blocks.map((block, idx) => (
        <BlockNode key={idx} block={block} callbacks={callbacks} />
      ))}
    </>
  );
};

interface BlockNodeProps {
  block: BlockAst;
  callbacks?: RendererCallbacks;
}

const BlockNode: React.FC<BlockNodeProps> = ({ block, callbacks }) => {
  const [type, data] = block;

  switch (type) {
    case 'Paragraph':
      return (
        <p className="lqm-paragraph">
          <InlineRenderer ast={data} callbacks={callbacks} />
        </p>
      );

    case 'Heading':
      return <HeadingNode data={data} callbacks={callbacks} />;

    case 'List':
      return <ListNode data={data} callbacks={callbacks} />;

    case 'Src':
      return <SrcNode data={data} />;

    case 'Quote':
      return (
        <blockquote className="lqm-blockquote">
          <BlockRenderer blocks={data} callbacks={callbacks} />
        </blockquote>
      );

    case 'Table':
      return <TableNode data={data} callbacks={callbacks} />;

    case 'Horizontal_Rule':
      return <hr className="lqm-hr" />;

    // Additional block types
    case 'Drawer':
      return (
        <div className="lqm-drawer" data-drawer-name={data.name}>
          <div className="lqm-drawer-name">{data.name}</div>
          <div className="lqm-drawer-content">
            <BlockRenderer blocks={data.content} callbacks={callbacks} />
          </div>
        </div>
      );

    case 'Property_Drawer':
      return (
        <div className="lqm-property-drawer">
          {Object.entries(data.properties).map(([key, value]) => (
            <div key={key} className="lqm-property">
              <span className="lqm-property-key">{key}:</span>
              <span className="lqm-property-value">{value}</span>
            </div>
          ))}
        </div>
      );

    case 'Custom': {
      const [customType, , , customContent] = data as any;
      return (
        <div className="lqm-custom" data-type={customType}>
          {customContent}
        </div>
      );
    }

    case 'Hiccup':
      return <div className="lqm-hiccup">{data}</div>;

    case 'Raw_Html':
      return <div className="lqm-raw-html" dangerouslySetInnerHTML={{ __html: data }} />;

    case 'Latex_Fragment': {
      const latexData = data as LatexData;
      return (
        <div className="lqm-latex-block">
          <MathBlock tex={latexData.content} displayMode={latexData.display_mode ?? true} />
        </div>
      );
    }

    case 'Footnote_Definition': {
      const [footnoteName, footnoteContent] = data as any;
      return (
        <div className="lqm-footnote-def" id={`fn-${footnoteName}`}>
          <span className="lqm-footnote-label">[{footnoteName}]</span>
          <InlineRenderer ast={footnoteContent} callbacks={callbacks} />
        </div>
      );
    }

    default:
      return null;
  }
};

// Heading rendering (h1-h6)
interface HeadingNodeProps {
  data: HeadingData;
  callbacks?: RendererCallbacks;
}

const HeadingNode: React.FC<HeadingNodeProps> = ({ data, callbacks }) => {
  const { title, level, tags, marker, priority } = data;
  const headingLevel = Math.min(Math.max(level, 1), 6);
  const className = `lqm-heading lqm-heading-${level}`;

  const headingContent = (
    <>
      {marker && <span className="lqm-heading-marker">{marker} </span>}
      {priority && <span className="lqm-heading-priority">[{priority}] </span>}
      <InlineRenderer ast={title} callbacks={callbacks} />
      {tags && tags.length > 0 && (
        <span className="lqm-heading-tags">
          {tags.map((tag, idx) => (
            <span key={idx} className="lqm-tag">
              #{tag}
            </span>
          ))}
        </span>
      )}
    </>
  );

  // Use React.createElement to create dynamic heading tag
  return React.createElement(`h${headingLevel}`, { className }, headingContent);
};

// List rendering (ordered, unordered, with checkboxes)
interface ListNodeProps {
  data: ListData;
  callbacks?: RendererCallbacks;
  parentPath?: number[];
}

const ListNode: React.FC<ListNodeProps> = ({ data, callbacks, parentPath = [] }) => {
  const { items, ordered } = data;
  const ListTag = ordered ? 'ol' : 'ul';
  const className = ordered ? 'lqm-list lqm-ordered-list' : 'lqm-list lqm-unordered-list';

  return (
    <ListTag className={className}>
      {items.map((item, idx) => (
        <ListItemNode
          key={idx}
          item={item}
          callbacks={callbacks}
          itemPath={[...parentPath, idx]}
        />
      ))}
    </ListTag>
  );
};

interface ListItemNodeProps {
  item: ListItem;
  callbacks?: RendererCallbacks;
  itemPath: number[];
}

const ListItemNode: React.FC<ListItemNodeProps> = ({ item, callbacks, itemPath }) => {
  const { content, children, checkbox } = item;
  const hasCheckbox = checkbox !== undefined && checkbox !== null;

  // Convert CheckboxState to boolean for checkbox input
  const isChecked = checkbox === 'DONE' || checkbox === 'DOING';

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (callbacks?.onCheckboxChange) {
      callbacks.onCheckboxChange(e.target.checked, itemPath);
    }
  };

  return (
    <li className={hasCheckbox ? 'lqm-list-item lqm-checkbox-item' : 'lqm-list-item'}>
      <div className="lqm-list-item-content">
        {hasCheckbox && (
          <input
            type="checkbox"
            className="lqm-checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
          />
        )}
        <InlineRenderer ast={content} callbacks={callbacks} />
      </div>
      {children && (
        <ListNode
          data={children}
          callbacks={callbacks}
          parentPath={itemPath}
        />
      )}
    </li>
  );
};

// Code block rendering
interface SrcNodeProps {
  data: SrcData;
}

const SrcNode: React.FC<SrcNodeProps> = ({ data }) => {
  const { language, lines } = data;
  const code = lines.join('\n');

  return <CodeBlock code={code} language={language} readOnly={true} />;
};

// Table rendering
interface TableNodeProps {
  data: TableData;
  callbacks?: RendererCallbacks;
}

const TableNode: React.FC<TableNodeProps> = ({ data, callbacks }) => {
  const { header, rows } = data;

  return (
    <table className="lqm-table">
      {header && header.length > 0 && (
        <thead>
          {header.map((headerRow, headerIdx) => (
            <tr key={headerIdx}>
              {headerRow.map((cell, cellIdx) => (
                <th key={cellIdx} className="lqm-table-header-cell">
                  <InlineRenderer ast={cell.content} callbacks={callbacks} />
                </th>
              ))}
            </tr>
          ))}
        </thead>
      )}
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr key={rowIdx} className="lqm-table-row">
            {row.map((cell, cellIdx) => (
              <td key={cellIdx} className="lqm-table-cell">
                <InlineRenderer ast={cell.content} callbacks={callbacks} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BlockRenderer;
