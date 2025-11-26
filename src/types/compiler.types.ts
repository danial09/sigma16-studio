export interface CompilerOptions {
  emitAsm: boolean;
  allocator: 'basic' | 'advanced';
}

export interface AstSpan {
  ast_node_id: number;
  kind: string;
  start_line: number;
  start_col: number;
  end_line: number;
  end_col: number;
  start_byte: number;
  end_byte: number;
}

export interface InstrMapping {
  instr_index: number;
  ast_node_id: number;
  component?: string;
  description?: string;
}

export interface ByAstGroup {
  ast_node_id: number;
  instr_indices: number[];
}

export interface ComponentGroup {
  component: string;
  instr_indices: number[];
}

export interface ArrayDeclaration {
  name: string;
  size: number;
}

export interface CompilationResult {
  success: boolean;
  error?: string | null;
  ir?: string[] | null;
  asm?: string[] | null;
  asm_ir_mapping?: Array<(number | null)> | null;
  arrays?: ArrayDeclaration[];
  ast_spans?: AstSpan[];
  instr_mappings?: InstrMapping[];
  by_ast?: ByAstGroup[];
  by_component?: ComponentGroup[];
}

export interface HighlightRange {
  startLine: number;
  startCol: number;
  endLine: number;
  endCol: number;
  type: 'statement' | 'block';
}

export interface LineHighlight {
  line: number;
  type: 'statement' | 'block';
}

export interface CompilerMappingSnapshot {
  astSpans: AstSpan[];
  spanById: Map<number, AstSpan>;
  byAst: Map<number, number[]>;
  instrMappings: InstrMapping[];
  instrToMaps: Map<number, InstrMapping[]>;
  asmIrMapping: (number | null)[];
  irToAsm: Map<number, number[]>;
  totalInstructions: number;
  totalAsmLines: number;
}

export interface CompilerState {
  source: string;
  options: CompilerOptions;
  isCompiling: boolean;
  result: CompilationResult | null;
  error: string | null;
  sourceHighlights: HighlightRange[];
  irHighlights: LineHighlight[];
  asmHighlights: LineHighlight[];
  mapping: CompilerMappingSnapshot | null;
}

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
}