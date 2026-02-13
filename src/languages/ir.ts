import * as monaco from 'monaco-editor';

export const SIGMA16_IR_LANG_ID = 'sigma16-ir';

export const sigma16IrLanguage: monaco.languages.IMonarchLanguage = {
  keywords: ['GOTO', 'if', 'ARRAY', 'FUNC', 'CALL', 'RETURN'],
  
  operators: ['=', '+', '-', '*', '/', '<', '>', '<=', '>=', ':'],
  
  tokenizer: {
    root: [
      // Labels
      [/^L\d+:/, 'label'],
      
      // Keywords
      [/\b(GOTO|if|ARRAY|FUNC|CALL|RETURN)\b/, 'keyword'],
      
      // Temp variables
      [/__t\d+/, 'variable.temp'],
      
      // Numbers
      [/\b\d+\b/, 'number'],
      
      // Identifiers
      [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier'],
      
      // Operators
      [/[=+\-*\/<>:]=?/, 'operator'],
      
      // Whitespace
      [/\s+/, ''],
    ],
  },
};

export const sigma16IrTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'C586C0' },
    { token: 'label', foreground: 'FFD700', fontStyle: 'bold' },
    { token: 'variable.temp', foreground: '4EC9B0' },
    { token: 'identifier', foreground: '9CDCFE' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'operator', foreground: 'D4D4D4' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
  },
};

export function registerSigma16Ir() {
  monaco.languages.register({ id: SIGMA16_IR_LANG_ID });
  monaco.languages.setMonarchTokensProvider(SIGMA16_IR_LANG_ID, sigma16IrLanguage);
  monaco.editor.defineTheme('sigma16-ir-dark', sigma16IrTheme);
}
