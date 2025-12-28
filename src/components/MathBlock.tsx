/**
 * MathBlock - A KaTeX-based math rendering component
 *
 * Features:
 * - Renders LaTeX mathematical expressions using KaTeX
 * - Supports both inline and display (block) modes
 * - Error handling for invalid LaTeX
 * - Themed CSS classes
 */

import React, { useMemo } from 'react';
import katex from 'katex';
import type { KatexOptions } from 'katex';
import 'katex/dist/katex.min.css';

interface MathBlockProps {
  tex: string;
  displayMode?: boolean; // true for block, false for inline
}

export const MathBlock: React.FC<MathBlockProps> = ({ tex, displayMode = false }) => {
  const { html, error } = useMemo(() => {
    try {
      const options: KatexOptions = {
        displayMode,
        throwOnError: false,
        errorColor: '#d32f2f',
        strict: 'warn',
      };

      const renderedHtml = katex.renderToString(tex, options);

      return { html: renderedHtml, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error rendering LaTeX';
      return { html: null, error: errorMessage };
    }
  }, [tex, displayMode]);

  const className = displayMode ? 'lqm-math lqm-math-block' : 'lqm-math lqm-math-inline';

  if (error) {
    return (
      <span className={`${className} lqm-math-error`} title={error}>
        <span style={{ color: '#d32f2f', fontSize: '0.875em' }}>
          [LaTeX Error: {error}]
        </span>
      </span>
    );
  }

  if (!html) {
    return null;
  }

  return (
    <span
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default MathBlock;
