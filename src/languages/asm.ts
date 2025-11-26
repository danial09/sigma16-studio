import * as monaco from 'monaco-editor';

export const SIGMA16_ASM_LANG_ID = 'sigma16-asm';

export const sigma16AsmLanguage: monaco.languages.IMonarchLanguage = {
  keywords: ['lea', 'jump', 'load', 'store', 'add', 'sub', 'mul', 'cmp', 
             'jge', 'jle', 'jg', 'jne', 'data'],
  
  registers: ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 
               'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15'],
  
  tokenizer: {
    root: [
      // Labels
      [/^[a-zA-Z_][a-zA-Z0-9_]*/, 'label'],
      
      // Instructions
      [/\b(lea|jump|load|store|add|sub|mul|cmp|jge|jle|jg|jne|data)\b/, 'keyword'],
      
      // Registers
      [/\bR\d{1,2}\b/, 'register'],
      
      // Memory references
      [/[a-zA-Z_][a-zA-Z0-9_]*\[/, { token: 'memory', next: '@memory' }],
      [/-?\d+\[/, { token: 'number', next: '@memory' }],
      
      // Numbers
      [/-?\d+/, 'number'],
      
      // Identifiers
      [/[a-zA-Z_][a-zA-Z0-9_]*/, 'identifier'],
      
      // Whitespace
      [/\s+/, ''],
      
      // Commas
      [/,/, 'delimiter'],
    ],
    
    memory: [
      [/\]/, { token: 'memory', next: '@pop' }],
      [/R\d{1,2}/, 'register'],
      [/./, 'memory'],
    ],
  },
};

export const sigma16AsmTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '4EC9B0' },
    { token: 'label', foreground: 'FFD700', fontStyle: 'bold' },
    { token: 'register', foreground: 'CE9178' },
    { token: 'memory', foreground: 'D16969' },
    { token: 'identifier', foreground: '9CDCFE' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'delimiter', foreground: 'D4D4D4' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
  },
};

export function registerSigma16Asm() {
  monaco.languages.register({ id: SIGMA16_ASM_LANG_ID });
  monaco.languages.setMonarchTokensProvider(SIGMA16_ASM_LANG_ID, sigma16AsmLanguage);
  monaco.editor.defineTheme('sigma16-asm-dark', sigma16AsmTheme);
}
