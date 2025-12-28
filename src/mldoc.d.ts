declare module 'mldoc' {
  export const Mldoc: {
    parseJson: (content: string, config: string) => string;
    parseInlineJson: (text: string, config: string) => string;
    astExportMarkdown: (ast: string, config: string, references: string) => string;
    getReferences: (text: string, config: string) => string;
  };
}
