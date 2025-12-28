/**
 * Main parser wrapper for mldoc
 * Provides TypeScript-friendly API for parsing Markdown/Org content
 */

import { Mldoc } from 'mldoc';
import type { ParsedBlock, InlineAst } from '../types';
import { createConfig, type ParserConfig } from './config';

/**
 * Parses markdown/org content into a typed AST structure
 * @param content - The markdown/org text to parse
 * @param config - Optional parser configuration
 * @returns Array of parsed blocks with position information
 */
export function parseContent(
  content: string,
  config?: Partial<ParserConfig>
): ParsedBlock[] {
  try {
    const parserConfig = createConfig(config);
    const configJson = JSON.stringify(parserConfig);
    const resultJson = Mldoc.parseJson(content, configJson);
    const rawBlocks = JSON.parse(resultJson);

    // Transform raw mldoc output to typed ParsedBlock format
    return rawBlocks.map(([ast, pos]: [any, any]) => ({
      ast,
      pos,
    }));
  } catch (error) {
    console.error('Parse error:', error);
    return [];
  }
}

/**
 * Parses inline markdown content (without block-level elements)
 * Useful for parsing text within blocks or for inline previews
 * @param text - The inline text to parse
 * @param config - Optional parser configuration
 * @returns Array of inline AST nodes
 */
export function parseInline(
  text: string,
  config?: Partial<ParserConfig>
): InlineAst[] {
  try {
    const parserConfig = createConfig(config);
    const configJson = JSON.stringify(parserConfig);
    const resultJson = Mldoc.parseInlineJson(text, configJson);
    return JSON.parse(resultJson);
  } catch (error) {
    console.error('Inline parse error:', error);
    return [];
  }
}

/**
 * Main parse function that wraps mldoc.parseJson
 * @param content - The content to parse
 * @param config - Optional parser configuration
 * @returns Array of parsed blocks
 */
export function parse(
  content: string,
  config?: Partial<ParserConfig>
): ParsedBlock[] {
  return parseContent(content, config);
}

// Re-export configuration utilities
export { createConfig, defaultConfig, type ParserConfig } from './config';
export type { ParsedBlock, InlineAst } from '../types';
