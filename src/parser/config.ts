/**
 * Parser configuration for mldoc
 */

export interface ParserConfig {
  /** Generate table of contents */
  toc?: boolean;
  /** Add heading numbers */
  heading_number?: boolean;
  /** Preserve line breaks in output */
  keep_line_break?: boolean;
  /** Input format type */
  format?: 'Markdown' | 'Org';
  /** Convert headings to list items */
  heading_to_list?: boolean;
  /** Parse only the document outline structure */
  parse_outline_only?: boolean;
}

/**
 * Default configuration optimized for Markdown parsing
 */
export const defaultConfig: ParserConfig = {
  toc: false,
  heading_number: false,
  keep_line_break: true,
  format: 'Markdown',
  heading_to_list: false,
  parse_outline_only: false,
};

/**
 * Creates a parser configuration by merging custom options with defaults
 * @param options - Partial configuration to override defaults
 * @returns Complete parser configuration
 */
export function createConfig(options?: Partial<ParserConfig>): ParserConfig {
  return {
    ...defaultConfig,
    ...options,
  };
}
