/**
 * InlineRenderer - Renders inline AST elements
 * Handles text formatting, links, tags, code, and special inline elements
 */

import React from 'react';
import { MathBlock } from '../components/MathBlock';
import type {
  InlineAst,
  EmphasisType,
  LinkData,
  NestedLinkData,
  MacroData,
  RendererCallbacks,
} from '../types';

interface InlineRendererProps {
  ast: InlineAst[];
  callbacks?: RendererCallbacks;
}

export const InlineRenderer: React.FC<InlineRendererProps> = ({ ast, callbacks }) => {
  if (!Array.isArray(ast)) {
    return null;
  }

  return (
    <>
      {ast.map((node, idx) => (
        <InlineNode key={idx} node={node} callbacks={callbacks} />
      ))}
    </>
  );
};

interface InlineNodeProps {
  node: InlineAst;
  callbacks?: RendererCallbacks;
}

const InlineNode: React.FC<InlineNodeProps> = ({ node, callbacks }) => {
  const [type, data] = node;

  switch (type) {
    case 'Plain':
      return <>{data}</>;

    case 'Emphasis':
      return <EmphasisNode data={data} callbacks={callbacks} />;

    case 'Link':
      return <LinkNode data={data} callbacks={callbacks} />;

    case 'Nested_link':
      return <NestedLinkNode data={data} callbacks={callbacks} />;

    case 'Tag':
      return <TagNode data={data} callbacks={callbacks} />;

    case 'Code':
      return <code className="lqm-inline-code">{data}</code>;

    case 'Verbatim':
      return <code className="lqm-verbatim">{data}</code>;

    case 'Macro':
      return <MacroNode data={data} />;

    case 'Subscript':
      return (
        <sub className="lqm-subscript">
          <InlineRenderer ast={data} callbacks={callbacks} />
        </sub>
      );

    case 'Superscript':
      return (
        <sup className="lqm-superscript">
          <InlineRenderer ast={data} callbacks={callbacks} />
        </sup>
      );

    // Additional inline types that we render as-is or skip
    case 'Timestamp':
      return <span className="lqm-timestamp">{JSON.stringify(data)}</span>;

    case 'Latex_Fragment':
      return <MathBlock tex={data as string} displayMode={false} />;

    case 'Inline_Html':
      return <span className="lqm-inline-html" dangerouslySetInnerHTML={{ __html: data }} />;

    case 'Email':
      return <a className="lqm-email" href={`mailto:${data.local_part}@${data.domain}`}>{data.local_part}@{data.domain}</a>;

    case 'Cookie':
      return <span className="lqm-cookie">{data.percent ? `[${data.percent}%]` : `[${data.current}/${data.total}]`}</span>;

    case 'Footnote_Reference':
      return <sup className="lqm-footnote-ref">[{data.name}]</sup>;

    default:
      return null;
  }
};

// Emphasis rendering (Bold, Italic, Underline, Strike_through, Highlight)
interface EmphasisNodeProps {
  data: [EmphasisType, InlineAst[]];
  callbacks?: RendererCallbacks;
}

const EmphasisNode: React.FC<EmphasisNodeProps> = ({ data, callbacks }) => {
  const [emphasisType, content] = data;

  const emphasisMap: Record<EmphasisType, { tag: string; className: string }> = {
    Bold: { tag: 'strong', className: 'lqm-bold' },
    Italic: { tag: 'em', className: 'lqm-italic' },
    Underline: { tag: 'u', className: 'lqm-underline' },
    Strike_through: { tag: 's', className: 'lqm-strikethrough' },
    Highlight: { tag: 'mark', className: 'lqm-highlight' },
  };

  const { tag, className } = emphasisMap[emphasisType] || { tag: 'span', className: '' };

  // Use React.createElement to create dynamic emphasis tag
  return React.createElement(
    tag,
    { className },
    <InlineRenderer ast={content} callbacks={callbacks} />
  );
};

// Link rendering (handles Page_ref, Block_ref, Complex links)
interface LinkNodeProps {
  data: LinkData;
  callbacks?: RendererCallbacks;
}

const LinkNode: React.FC<LinkNodeProps> = ({ data, callbacks }) => {
  const { url, label, full_text } = data;

  if (!url) {
    return <span>{full_text}</span>;
  }

  const [urlType, urlValue] = url;

  switch (urlType) {
    case 'Page_ref':
      return (
        <a
          className="lqm-page-ref"
          href={`#${urlValue}`}
          onClick={(e) => {
            if (callbacks?.onPageClick) {
              e.preventDefault();
              callbacks.onPageClick(urlValue);
            }
          }}
        >
          [[{urlValue}]]
        </a>
      );

    case 'Block_ref':
      return (
        <span
          className="lqm-block-ref"
          onClick={(e) => {
            if (callbacks?.onBlockClick) {
              e.preventDefault();
              callbacks.onBlockClick(urlValue);
            }
          }}
          style={{ cursor: callbacks?.onBlockClick ? 'pointer' : 'default' }}
        >
          (({urlValue}))
        </span>
      );

    case 'Search':
      return (
        <a className="lqm-search-link" href={`?q=${encodeURIComponent(urlValue)}`}>
          <InlineRenderer ast={label} callbacks={callbacks} />
        </a>
      );

    case 'Complex':
      const complexUrl = `${urlValue.protocol}://${urlValue.link}`;
      return (
        <a className="lqm-external-link" href={complexUrl} target="_blank" rel="noopener noreferrer">
          <InlineRenderer ast={label} callbacks={callbacks} />
        </a>
      );

    case 'File':
      return (
        <a className="lqm-file-link" href={urlValue}>
          <InlineRenderer ast={label} callbacks={callbacks} />
        </a>
      );

    case 'Embed_data':
      return (
        <a className="lqm-embed-link" href={urlValue}>
          <InlineRenderer ast={label} callbacks={callbacks} />
        </a>
      );

    default:
      return <span>{full_text}</span>;
  }
};

// Nested link (wiki-link) rendering
interface NestedLinkNodeProps {
  data: NestedLinkData;
  callbacks?: RendererCallbacks;
}

const NestedLinkNode: React.FC<NestedLinkNodeProps> = ({ data, callbacks }) => {
  const { content, children } = data;

  return (
    <a
      className="lqm-page-ref"
      href={`#${content}`}
      onClick={(e) => {
        if (callbacks?.onPageClick) {
          e.preventDefault();
          callbacks.onPageClick(content);
        }
      }}
    >
      [[{content}
      {children && children.length > 0 && (
        <>
          <InlineRenderer ast={children} callbacks={callbacks} />
        </>
      )}
      ]]
    </a>
  );
};

// Tag rendering
interface TagNodeProps {
  data: InlineAst[];
  callbacks?: RendererCallbacks;
}

const TagNode: React.FC<TagNodeProps> = ({ data, callbacks }) => {
  // Extract plain text from tag content for callback
  const tagText = extractPlainText(data);

  return (
    <span
      className="lqm-tag"
      onClick={(e) => {
        if (callbacks?.onTagClick) {
          e.preventDefault();
          callbacks.onTagClick(tagText);
        }
      }}
      style={{ cursor: callbacks?.onTagClick ? 'pointer' : 'default' }}
    >
      #<InlineRenderer ast={data} callbacks={callbacks} />
    </span>
  );
};

// Macro rendering
interface MacroNodeProps {
  data: MacroData;
}

const MacroNode: React.FC<MacroNodeProps> = ({ data }) => {
  const { name, arguments: args } = data;

  return (
    <span className="lqm-macro" data-macro-name={name}>
      {'{{'}
      {name}
      {args.length > 0 && ` ${args.join(' ')}`}
      {'}}'}
    </span>
  );
};

// Utility: Extract plain text from inline AST
function extractPlainText(ast: InlineAst[]): string {
  return ast
    .map((node) => {
      const [type, data] = node;
      if (type === 'Plain') {
        return data;
      } else if (type === 'Emphasis') {
        return extractPlainText(data[1]);
      } else if (Array.isArray(data)) {
        return extractPlainText(data as InlineAst[]);
      }
      return '';
    })
    .join('');
}

export default InlineRenderer;
