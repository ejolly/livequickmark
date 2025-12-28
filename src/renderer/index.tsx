/**
 * Main Renderer Component
 * Entry point for rendering markdown content using the live-quick-mark library
 */

import React, { useMemo } from 'react';
import { BlockRenderer } from './BlockRenderer';
import { parseContent } from '../parser';
import type { RendererCallbacks, ParserConfig } from '../types';

export interface RendererProps {
  /** The markdown/org content to render */
  content: string;

  /** Parser configuration options */
  config?: Partial<ParserConfig>;

  /** Callback when a page reference is clicked */
  onPageClick?: (pageName: string) => void;

  /** Callback when a block reference is clicked */
  onBlockClick?: (blockId: string) => void;

  /** Callback when a tag is clicked */
  onTagClick?: (tag: string) => void;

  /** Callback when a checkbox state changes */
  onCheckboxChange?: (checked: boolean, itemIndex: number[]) => void;

  /** Optional CSS class name for the container */
  className?: string;

  /** Optional inline styles for the container */
  style?: React.CSSProperties;
}

/**
 * Renderer - Main component for rendering markdown content
 *
 * Takes markdown/org content string and renders it to React elements
 * using the mldoc parser and AST renderers.
 *
 * @example
 * ```tsx
 * <Renderer
 *   content="# Hello [[World]]\nThis is **bold** text."
 *   onPageClick={(page) => console.log('Clicked page:', page)}
 *   onBlockClick={(id) => console.log('Clicked block:', id)}
 *   onTagClick={(tag) => console.log('Clicked tag:', tag)}
 * />
 * ```
 */
export const Renderer: React.FC<RendererProps> = ({
  content,
  config,
  onPageClick,
  onBlockClick,
  onTagClick,
  onCheckboxChange,
  className = 'lqm-renderer',
  style,
}) => {
  // Parse content to AST
  const parsedBlocks = useMemo(() => {
    return parseContent(content, config);
  }, [content, config]);

  // Collect callbacks
  const callbacks: RendererCallbacks = useMemo(() => ({
    onPageClick,
    onBlockClick,
    onTagClick,
    onCheckboxChange,
  }), [onPageClick, onBlockClick, onTagClick, onCheckboxChange]);

  // Extract just the AST blocks (without position info)
  const blocks = useMemo(() => {
    return parsedBlocks.map((block) => block.ast);
  }, [parsedBlocks]);

  // Handle empty content
  if (!content || content.trim() === '') {
    return (
      <div className={`${className} lqm-empty`} style={style}>
        <span className="lqm-placeholder">Empty content</span>
      </div>
    );
  }

  // Handle parse errors
  if (blocks.length === 0 && content.trim() !== '') {
    return (
      <div className={`${className} lqm-error`} style={style}>
        <span className="lqm-error-message">Failed to parse content</span>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <BlockRenderer blocks={blocks} callbacks={callbacks} />
    </div>
  );
};

// Re-export components and types for convenience
export { BlockRenderer } from './BlockRenderer';
export { InlineRenderer } from './InlineRenderer';
export type { RendererCallbacks } from '../types';

export default Renderer;
