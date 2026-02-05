import { AstSpan, CompilationResult, CompilerMappingSnapshot } from '@/types/compiler.types';
import { buildMappingSnapshot } from '@/services/highlighting';

export function makeSpan(overrides: Partial<AstSpan> & { ast_node_id: number; kind: string }): AstSpan {
    return {
        start_line: 0,
        start_col: 0,
        end_line: 0,
        end_col: 10,
        start_byte: 0,
        end_byte: 10,
        ...overrides,
    };
}

export function makeCompilationResult(overrides?: Partial<CompilationResult>): CompilationResult {
    return {
        success: true,
        ir: [
            '__t0 = 5',       // 0
            'x = __t0',       // 1
            '__t1 = 10',      // 2
            'y = __t1',       // 3
            '__t2 = x < y',   // 4
            'if __t2 GOTO L0', // 5
            'GOTO L1',         // 6
            'L0: __t3 = x + y', // 7
            'z = __t3',         // 8
            'GOTO L2',          // 9
            'L1: __t4 = x - y', // 10
            'z = __t4',         // 11
            'L2:',              // 12
        ],
        asm: [
            'lea R1,5[R0]',       // 0
            'store R1,x[R0]',     // 1
            'lea R1,10[R0]',      // 2
            'store R1,y[R0]',     // 3
            'load R1,x[R0]',      // 4
            'load R2,y[R0]',      // 5
            'cmp R1,R2',          // 6
        ],
        ast_spans: [
            makeSpan({ ast_node_id: 1, kind: 'Assign', start_line: 0, start_col: 0, end_line: 0, end_col: 6, start_byte: 0, end_byte: 6 }),
            makeSpan({ ast_node_id: 2, kind: 'Assign', start_line: 1, start_col: 0, end_line: 1, end_col: 7, start_byte: 7, end_byte: 14 }),
            makeSpan({ ast_node_id: 3, kind: 'If', start_line: 2, start_col: 0, end_line: 6, end_col: 1, start_byte: 15, end_byte: 60 }),
            makeSpan({ ast_node_id: 4, kind: 'Binary', start_line: 2, start_col: 3, end_line: 2, end_col: 8, start_byte: 18, end_byte: 23 }),
            makeSpan({ ast_node_id: 5, kind: 'Assign', start_line: 3, start_col: 2, end_line: 3, end_col: 12, start_byte: 26, end_byte: 36 }),
        ],
        instr_mappings: [
            { instr_index: 0, ast_node_id: 1 },
            { instr_index: 1, ast_node_id: 1 },
            { instr_index: 2, ast_node_id: 2 },
            { instr_index: 3, ast_node_id: 2 },
            { instr_index: 4, ast_node_id: 4, component: 'Condition' },
            { instr_index: 5, ast_node_id: 3, component: 'ControlFlowGlue' },
            { instr_index: 6, ast_node_id: 3, component: 'ControlFlowGlue' },
            { instr_index: 7, ast_node_id: 5, component: 'ThenBranch' },
            { instr_index: 8, ast_node_id: 5, component: 'ThenBranch' },
        ],
        by_ast: [
            { ast_node_id: 1, instr_indices: [0, 1] },
            { ast_node_id: 2, instr_indices: [2, 3] },
            { ast_node_id: 4, instr_indices: [4] },
            { ast_node_id: 5, instr_indices: [7, 8] },
            { ast_node_id: 3, instr_indices: [5, 6] },
        ],
        asm_ir_mapping: [0, 1, 2, 3, 4, 4, 5],
        ...overrides,
    };
}

export function makeSnapshot(overrides?: Partial<CompilationResult>): CompilerMappingSnapshot {
    const result = makeCompilationResult(overrides);
    const snapshot = buildMappingSnapshot(result);
    if (!snapshot) throw new Error('Failed to build snapshot from test fixture');
    return snapshot;
}
