export default function init() {
    return Promise.resolve();
}

export function compile_snapshot() {
    return {
        success: true,
        ir: ['__t0 = 5', 'x = __t0'],
        asm: ['lea R1,5[R0]', 'store R1,x[R0]'],
        ast_spans: [],
        instr_mappings: [],
        by_ast: [],
        asm_ir_mapping: [0, 1],
    };
}
