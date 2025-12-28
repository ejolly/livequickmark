/**
 * TypeScript type definitions for the mldoc AST (Abstract Syntax Tree)
 *
 * mldoc is an OCaml-based parser for Markdown and Org-mode that compiles to JavaScript.
 * These types represent the JSON output from mldoc's parseJson() and parseInlineJson() functions.
 *
 * @see https://github.com/logseq/mldoc
 */

// ============================================================================
// Block-level AST Types
// ============================================================================

/**
 * Represents a paragraph block containing inline elements
 */
export type ParagraphBlock = ['Paragraph', InlineAst[]];

/**
 * Represents a heading block with level, title, and optional metadata
 */
export type HeadingBlock = ['Heading', HeadingData];

/**
 * Represents a list (ordered or unordered) with optional checkboxes
 */
export type ListBlock = ['List', ListData];

/**
 * Represents a source code block with language and content
 */
export type SrcBlock = ['Src', SrcData];

/**
 * Represents a blockquote containing other blocks
 */
export type QuoteBlock = ['Quote', BlockAst[]];

/**
 * Represents a table with headers and rows
 */
export type TableBlock = ['Table', TableData];

/**
 * Represents a drawer (Org-mode feature for collapsible content)
 */
export type DrawerBlock = ['Drawer', DrawerData];

/**
 * Represents a property drawer (Org-mode feature for metadata)
 */
export type PropertyDrawerBlock = ['Property_Drawer', PropertyData];

/**
 * Represents a custom block with type, options, result, and content
 */
export type CustomBlock = ['Custom', string, string, string, string];

/**
 * Represents raw Hiccup markup (ClojureScript HTML representation)
 */
export type HiccupBlock = ['Hiccup', string];

/**
 * Represents raw HTML content
 */
export type RawHtmlBlock = ['Raw_Html', string];

/**
 * Represents a LaTeX fragment for mathematical expressions
 */
export type LatexFragmentBlock = ['Latex_Fragment', LatexData];

/**
 * Represents a horizontal rule/divider
 */
export type HorizontalRuleBlock = ['Horizontal_Rule'];

/**
 * Represents a footnote definition
 */
export type FootnoteDefinitionBlock = ['Footnote_Definition', string, InlineAst[]];

/**
 * Union type of all possible block-level AST nodes
 */
export type BlockAst =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | SrcBlock
  | QuoteBlock
  | TableBlock
  | DrawerBlock
  | PropertyDrawerBlock
  | CustomBlock
  | HiccupBlock
  | RawHtmlBlock
  | LatexFragmentBlock
  | HorizontalRuleBlock
  | FootnoteDefinitionBlock;

// ============================================================================
// Inline-level AST Types
// ============================================================================

/**
 * Represents plain text content
 */
export type PlainInline = ['Plain', string];

/**
 * Represents emphasized text (bold, italic, underline, strikethrough, highlight)
 */
export type EmphasisInline = ['Emphasis', [EmphasisType, InlineAst[]]];

/**
 * Represents a link with URL, label, and full text
 */
export type LinkInline = ['Link', LinkData];

/**
 * Represents a nested wiki-link [[page]]
 */
export type NestedLinkInline = ['Nested_link', NestedLinkData];

/**
 * Represents a hashtag #tag
 */
export type TagInline = ['Tag', InlineAst[]];

/**
 * Represents inline code `code`
 */
export type CodeInline = ['Code', string];

/**
 * Represents verbatim text (similar to code but no syntax highlighting)
 */
export type VerbatimInline = ['Verbatim', string];

/**
 * Represents a macro invocation {{macro arg1 arg2}}
 */
export type MacroInline = ['Macro', MacroData];

/**
 * Represents a timestamp
 */
export type TimestampInline = ['Timestamp', TimestampData];

/**
 * Represents subscript text
 */
export type SubscriptInline = ['Subscript', InlineAst[]];

/**
 * Represents superscript text
 */
export type SuperscriptInline = ['Superscript', InlineAst[]];

/**
 * Represents an inline LaTeX fragment
 */
export type LatexFragmentInline = ['Latex_Fragment', string];

/**
 * Represents inline HTML
 */
export type InlineHtmlInline = ['Inline_Html', string];

/**
 * Represents an email address
 */
export type EmailInline = ['Email', EmailData];

/**
 * Represents a cookie (Org-mode progress indicator like [2/5] or [40%])
 */
export type CookieInline = ['Cookie', CookieData];

/**
 * Represents a footnote reference
 */
export type FootnoteReferenceInline = ['Footnote_Reference', FootnoteRefData];

/**
 * Union type of all possible inline-level AST nodes
 */
export type InlineAst =
  | PlainInline
  | EmphasisInline
  | LinkInline
  | NestedLinkInline
  | TagInline
  | CodeInline
  | VerbatimInline
  | MacroInline
  | TimestampInline
  | SubscriptInline
  | SuperscriptInline
  | LatexFragmentInline
  | InlineHtmlInline
  | EmailInline
  | CookieInline
  | FootnoteReferenceInline;

// ============================================================================
// Supporting Type Definitions
// ============================================================================

/**
 * Types of text emphasis
 */
export type EmphasisType =
  | 'Bold'
  | 'Italic'
  | 'Underline'
  | 'Strike_through'
  | 'Highlight';

/**
 * Types of link URLs
 */
export type LinkUrlType =
  | ['Page_ref', string]      // Wiki-link to a page [[page-name]]
  | ['Block_ref', string]     // Block reference ((block-uuid))
  | ['Search', string]        // Search query
  | ['Complex', ComplexUrl]   // Standard URL with protocol
  | ['File', string]          // File path
  | ['Embed_data', string];   // Embedded data URL

/**
 * Complex URL structure with protocol and link
 */
export interface ComplexUrl {
  protocol: string;
  link: string;
}

/**
 * Link data including URL, label, and full text representation
 */
export interface LinkData {
  url: LinkUrlType;
  label: InlineAst[];
  full_text: string;
  title?: string;           // Optional link title
  metadata?: string;        // Optional metadata
}

/**
 * Nested link data for wiki-links [[page]]
 */
export interface NestedLinkData {
  content: string;
  children?: InlineAst[];
}

/**
 * Heading data with title, level, and optional metadata
 */
export interface HeadingData {
  title: InlineAst[];
  level: number;              // 1-6 for h1-h6
  tags?: string[];            // Optional tags
  marker?: string;            // Optional TODO/DONE marker
  priority?: string;          // Optional priority (A, B, C, etc.)
  properties?: PropertyMap;   // Optional properties
  anchor?: string;            // Optional anchor ID
  meta?: HeadingMeta;         // Optional metadata
}

/**
 * Additional metadata for headings
 */
export interface HeadingMeta {
  timestamps?: TimestampData[];
  repeated?: RepeatedData;
}

/**
 * List data structure
 */
export interface ListData {
  items: ListItem[];
  ordered: boolean;           // true for ordered (1. 2. 3.), false for unordered (- * +)
  indent?: number;            // Indentation level
  start_number?: number;      // Starting number for ordered lists
}

/**
 * Individual list item
 */
export interface ListItem {
  content: InlineAst[];
  checkbox?: CheckboxState;   // Optional checkbox state
  children?: ListData;        // Nested list items
  indent?: number;            // Indentation level
}

/**
 * Checkbox state for task lists
 */
export type CheckboxState = 'TODO' | 'DOING' | 'DONE' | 'WAITING' | 'CANCELED';

/**
 * Source code block data
 */
export interface SrcData {
  lines: string[];            // Lines of code
  language?: string;          // Programming language
  options?: string[];         // Additional options
  pos_meta?: {                // Position metadata
    start_pos: number;
    end_pos: number;
  };
}

/**
 * Table data structure
 */
export interface TableData {
  header: TableRow[];
  rows: TableRow[];
  col_groups?: number[];      // Column groupings
}

/**
 * Table row containing cells
 */
export type TableRow = TableCell[];

/**
 * Table cell containing inline elements
 */
export interface TableCell {
  content: InlineAst[];
}

/**
 * Drawer data (Org-mode feature)
 */
export interface DrawerData {
  name: string;
  content: BlockAst[];
}

/**
 * Property drawer data (key-value pairs)
 */
export interface PropertyData {
  properties: PropertyMap;
}

/**
 * Map of property names to values
 */
export type PropertyMap = Record<string, string>;

/**
 * LaTeX fragment data
 */
export interface LatexData {
  content: string;
  display_mode?: boolean;     // true for display math, false for inline
}

/**
 * Macro data with name and arguments
 */
export interface MacroData {
  name: string;
  arguments: string[];
}

/**
 * Timestamp data (Org-mode feature)
 */
export interface TimestampData {
  date: DateData;
  time?: TimeData;
  repetition?: RepeatedData;
  active?: boolean;           // Active <...> vs inactive [...]
  range?: {                   // For timestamp ranges
    date: DateData;
    time?: TimeData;
  };
}

/**
 * Date data
 */
export interface DateData {
  year: number;
  month: number;
  day: number;
  dayname?: string;           // Day of week
}

/**
 * Time data
 */
export interface TimeData {
  hour: number;
  min: number;
}

/**
 * Repeated timestamp data (for recurring tasks)
 */
export interface RepeatedData {
  kind: 'Dotted' | 'Plus' | 'DoublePlus';
  value: number;
  unit: 'Year' | 'Month' | 'Week' | 'Day' | 'Hour';
}

/**
 * Email data
 */
export interface EmailData {
  local_part: string;
  domain: string;
}

/**
 * Cookie data (progress indicators)
 */
export interface CookieData {
  percent?: number;           // For percentage cookies [40%]
  current?: number;           // For fraction cookies [2/5]
  total?: number;             // For fraction cookies [2/5]
}

/**
 * Footnote reference data
 */
export interface FootnoteRefData {
  name: string;
  definition?: InlineAst[];
}

// ============================================================================
// Position Metadata
// ============================================================================

/**
 * Position information for a block in the source text
 */
export interface Position {
  start_pos: number;          // Starting character position
  end_pos: number;            // Ending character position
}

/**
 * A parsed block with its AST and position information
 * This is the format returned by mldoc.parseJson()
 */
export interface ParsedBlock {
  ast: BlockAst;
  pos: Position;
}

/**
 * Array of parsed blocks (main output from mldoc parser)
 */
export type ParsedBlocks = [BlockAst, Position][];

// ============================================================================
// Parser Configuration
// ============================================================================

/**
 * Configuration options for the mldoc parser
 */
export interface ParserConfig {
  /** Generate table of contents */
  toc?: boolean;

  /** Add heading numbers (1.1, 1.2, etc.) */
  heading_number?: boolean;

  /** Preserve line breaks in output */
  keep_line_break?: boolean;

  /** Input format */
  format?: 'Markdown' | 'Org';

  /** Convert headings to lists */
  heading_to_list?: boolean;

  /** Parse only the outline structure (headings only) */
  parse_outline_only?: boolean;

  /** Additional export options */
  export_options?: ExportOptions;
}

/**
 * Export options for different output formats
 */
export interface ExportOptions {
  heading_to_list?: boolean;
  keep_line_break?: boolean;
  newline?: string;
  heading_number?: boolean;
  toc?: boolean;
  timestamp_display?: 'full' | 'date' | 'time';
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if an AST node is a specific block type
 */
export function isBlockType<T extends BlockAst[0]>(
  ast: BlockAst,
  type: T
): ast is Extract<BlockAst, [T, ...any[]]> {
  return ast[0] === type;
}

/**
 * Type guard to check if an AST node is a specific inline type
 */
export function isInlineType<T extends InlineAst[0]>(
  ast: InlineAst,
  type: T
): ast is Extract<InlineAst, [T, ...any[]]> {
  return ast[0] === type;
}

/**
 * Type guard to check if a link URL is a page reference
 */
export function isPageRef(url: LinkUrlType): url is ['Page_ref', string] {
  return url[0] === 'Page_ref';
}

/**
 * Type guard to check if a link URL is a block reference
 */
export function isBlockRef(url: LinkUrlType): url is ['Block_ref', string] {
  return url[0] === 'Block_ref';
}

/**
 * Type guard to check if a link URL is a complex URL
 */
export function isComplexUrl(url: LinkUrlType): url is ['Complex', ComplexUrl] {
  return url[0] === 'Complex';
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract the data type from an AST node
 */
export type AstData<T extends BlockAst | InlineAst> = T extends [any, infer D] ? D : never;

/**
 * Extract the type tag from an AST node
 */
export type AstType<T extends BlockAst | InlineAst> = T[0];
