/**
 * CodeBlock - A CodeMirror-based code editor component
 *
 * Features:
 * - Syntax highlighting for multiple languages
 * - Copy to clipboard functionality
 * - Read-only and editable modes
 * - Language label in header
 * - Themed to match the editor
 */

import React, { useEffect, useRef } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';

interface CodeBlockProps {
  code: string;
  language?: string;
  onChange?: (code: string) => void;
  readOnly?: boolean;
}

// Language extension mapping
const languageExtensions: Record<string, any> = {
  javascript: javascript(),
  js: javascript(),
  jsx: javascript({ jsx: true }),
  typescript: javascript({ typescript: true }),
  ts: javascript({ typescript: true }),
  tsx: javascript({ typescript: true, jsx: true }),
  python: python(),
  py: python(),
  html: html(),
  css: css(),
  json: json(),
  markdown: markdown(),
  md: markdown(),
};

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  onChange,
  readOnly = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Get language extension or null if unsupported
  const languageExtension = language ? languageExtensions[language.toLowerCase()] : null;

  useEffect(() => {
    if (!editorRef.current) return;

    // If language is not supported, don't use CodeMirror
    if (!languageExtension && language) {
      return;
    }

    const extensions = [
      lineNumbers(),
      highlightActiveLineGutter(),
      highlightActiveLine(),
      history(),
      bracketMatching(),
      syntaxHighlighting(defaultHighlightStyle),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.editable.of(!readOnly),
      EditorState.readOnly.of(readOnly),
      EditorView.theme({
        '&': {
          backgroundColor: 'var(--lqm-code-bg, #263238)',
          color: 'var(--lqm-code-text, #aed581)',
          fontSize: '0.875rem',
          fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
        },
        '.cm-content': {
          caretColor: 'var(--lqm-code-caret, #fff)',
        },
        '&.cm-focused .cm-cursor': {
          borderLeftColor: 'var(--lqm-code-caret, #fff)',
        },
        '&.cm-focused .cm-selectionBackground, ::selection': {
          backgroundColor: 'var(--lqm-code-selection, #37474f)',
        },
        '.cm-gutters': {
          backgroundColor: 'var(--lqm-code-gutter-bg, #1e282d)',
          color: 'var(--lqm-code-gutter-text, #546e7a)',
          border: 'none',
        },
        '.cm-activeLineGutter': {
          backgroundColor: 'var(--lqm-code-active-line-gutter, #263238)',
        },
        '.cm-activeLine': {
          backgroundColor: 'var(--lqm-code-active-line, #2d3e47)',
        },
      }),
    ];

    // Add language extension if available
    if (languageExtension) {
      extensions.push(languageExtension);
    }

    // Add onChange listener if provided
    if (onChange && !readOnly) {
      extensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString());
          }
        })
      );
    }

    const state = EditorState.create({
      doc: code,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [code, language, languageExtension, onChange, readOnly]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Fallback to plain pre/code for unsupported languages
  if (!languageExtension && language) {
    return (
      <div className="lqm-code-block-wrapper">
        <div
          className="lqm-code-block-language"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{language}</span>
          <button
            onClick={handleCopy}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              opacity: 0.8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <pre className="lqm-code-block">
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    );
  }

  return (
    <div className="lqm-code-block-wrapper">
      {language && (
        <div
          className="lqm-code-block-language"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{language}</span>
          <button
            onClick={handleCopy}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              fontSize: '0.75rem',
              padding: '0.25rem 0.5rem',
              opacity: 0.8,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.8')}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      )}
      <div ref={editorRef} style={{ borderRadius: language ? '0 0 4px 4px' : '4px' }} />
    </div>
  );
};

export default CodeBlock;
