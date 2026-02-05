import { AstSpan } from '@/types/compiler.types';

export const PREFERRED_KINDS = new Set(['Binary', 'Unary', 'Assign', 'If', 'While', 'For']);
export const CONTROL_KINDS = new Set(['If', 'While', 'For']);
export const BLOCK_COMPONENTS = new Set(['ThenBranch', 'ElseBranch', 'LoopBody']);

const COMPONENT_NORMALIZATION: Record<string, string> = {
    condition: 'Condition',
    Condition: 'Condition',
    thenBranch: 'ThenBranch',
    ThenBranch: 'ThenBranch',
    elseBranch: 'ElseBranch',
    ElseBranch: 'ElseBranch',
    loopBody: 'LoopBody',
    LoopBody: 'LoopBody',
    controlFlowGlue: 'ControlFlowGlue',
    ControlFlowGlue: 'ControlFlowGlue',
};

export function normalizeComponentName(value?: string | null): string | null {
    if (!value) return null;
    return COMPONENT_NORMALIZATION[value] ?? value;
}

export function containsPosition(span: AstSpan, line: number, column: number): boolean {
    if (line < span.start_line || line > span.end_line) return false;
    if (line === span.start_line && column < span.start_col) return false;
    if (line === span.end_line && column >= span.end_col) return false;
    return true;
}

export function spanLength(span: AstSpan): number {
    return Math.max(0, span.end_byte - span.start_byte);
}
