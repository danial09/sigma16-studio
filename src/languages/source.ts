import * as monaco from 'monaco-editor';

export const SIGMA16_SOURCE_LANG_ID = 'sigma16-source';

export const sigma16SourceLanguage: monaco.languages.IMonarchLanguage = {
  keywords: ['if', 'else', 'while', 'for', 'from', 'to', 'array'],
  
  operators: ['=', '+', '-', '*', '/', '<', '>', '<=', '>='],
  
  tokenizer: {
    root: [
      // Comments
      [/\/\/.*$/, 'comment'],
      
      // Keywords
      [/\b(if|else|while|for|from|to|array)\b/, 'keyword'],
      
      // Numbers
      [/\b\d+\b/, 'number'],
      
      // Identifiers
      [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier'],
      
      // Operators
      [/[=+\-*\/<>]=?/, 'operator'],
      
      // Brackets
      [/[{}]/, 'bracket'],
      
      // Whitespace
      [/\s+/, ''],
      
      // Semicolons
      [/;/, 'delimiter'],
    ],
  },
};

export const sigma16SourceTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '569CD6' },
    { token: 'identifier', foreground: '9CDCFE' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'operator', foreground: 'D4D4D4' },
    { token: 'comment', foreground: '6A9955' },
    { token: 'bracket', foreground: 'FFD700' },
    { token: 'delimiter', foreground: 'D4D4D4' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
  },
};

export function registerSigma16Source() {
  monaco.languages.register({ id: SIGMA16_SOURCE_LANG_ID });
  monaco.languages.setMonarchTokensProvider(SIGMA16_SOURCE_LANG_ID, sigma16SourceLanguage);
  monaco.editor.defineTheme('sigma16-source-dark', sigma16SourceTheme);
}
