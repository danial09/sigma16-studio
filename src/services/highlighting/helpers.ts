import { AstSpan, HighlightType } from '@/types/compiler.types';

export const PREFERRED_KINDS = new Set(['Binary', 'Unary', 'Assign', 'If', 'While', 'For']);
export const CONTROL_KINDS = new Set(['If', 'While', 'For']);
export const BLOCK_COMPONENTS = new Set(['ThenBranch', 'ElseBranch', 'LoopBody']);
export const ALL_COMPONENTS = new Set(['Condition', 'ThenBranch', 'ElseBranch', 'LoopBody', 'ControlFlowGlue']);

const COMPONENT_TO_HIGHLIGHT: Record<string, HighlightType> = {
    Condition: 'condition',
    ThenBranch: 'then-branch',
    ElseBranch: 'else-branch',
    LoopBody: 'loop-body',
    ControlFlowGlue: 'control-glue',
};

export function componentToHighlightType(component: string | null): HighlightType | null {
    if (!component) return null;
    return COMPONENT_TO_HIGHLIGHT[component] ?? null;
}

/**
 * Determine the highlight type for a set of "statement" (hovered) instructions
 * based on their dominant component. Returns 'statement' if no component is found.
 */
export function resolveStmtHighlightType(
    instrIndices: Set<number>,
    snapshot: { instrToMaps: Map<number, { component?: string }[]> },
): HighlightType {
    const counts = new Map<string, number>();
    for (const idx of instrIndices) {
        const maps = snapshot.instrToMaps.get(idx);
        if (!maps) continue;
        for (const mapping of maps) {
            const component = normalizeComponentName(mapping.component);
            if (!component || !ALL_COMPONENTS.has(component)) continue;
            counts.set(component, (counts.get(component) ?? 0) + 1);
        }
    }
    let best: string | null = null;
    let bestCount = 0;
    for (const [component, count] of counts.entries()) {
        if (count > bestCount) { best = component; bestCount = count; }
    }
    return componentToHighlightType(best) ?? 'statement';
}

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
