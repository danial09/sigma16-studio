import { AstSpan, CompilerMappingSnapshot, HighlightRange, HighlightType, LineHighlight } from '@/types/compiler.types';
import { ALL_COMPONENTS, BLOCK_COMPONENTS, CONTROL_KINDS, componentToHighlightType, normalizeComponentName, spanLength } from './helpers';

export function buildLineHighlights(
    stmtSet: Set<number>,
    stmtType: HighlightType,
    componentSets: Map<HighlightType, Set<number>>,
): LineHighlight[] {
    const lineTypes = new Map<number, HighlightType>();

    // Component lines first (lower priority)
    for (const [type, indices] of componentSets) {
        for (const line of indices) {
            if (!stmtSet.has(line)) {
                lineTypes.set(line, type);
            }
        }
    }

    // Statement lines always take priority, using their resolved type
    for (const line of stmtSet) {
        lineTypes.set(line, stmtType);
    }

    return Array.from(lineTypes.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([line, type]) => ({ line, type }));
}

export function buildAsmLineHighlights(
    stmtSet: Set<number>,
    stmtType: HighlightType,
    componentSets: Map<HighlightType, Set<number>>,
    snapshot: CompilerMappingSnapshot,
): LineHighlight[] {
    if (!snapshot.irToAsm.size) return [];

    const lineKinds = new Map<number, HighlightType>();

    // Component lines first (lower priority)
    for (const [type, indices] of componentSets) {
        for (const idx of indices) {
            const asmLines = snapshot.irToAsm.get(idx);
            if (!asmLines) continue;
            for (const line of asmLines) {
                if (!lineKinds.has(line)) lineKinds.set(line, type);
            }
        }
    }

    // Statement lines overwrite (higher priority), using their resolved type
    for (const idx of stmtSet) {
        const asmLines = snapshot.irToAsm.get(idx);
        if (!asmLines) continue;
        for (const line of asmLines) {
            lineKinds.set(line, stmtType);
        }
    }

    return Array.from(lineKinds.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([line, type]) => ({ line, type }));
}

export function convertAstIdsToRanges(
    ids: Iterable<number>,
    type: HighlightType,
    snapshot: CompilerMappingSnapshot,
): HighlightRange[] {
    const ranges: HighlightRange[] = [];
    for (const id of ids) {
        const span = snapshot.spanById.get(id);
        if (!span) continue;
        ranges.push({
            startLine: span.start_line,
            startCol: span.start_col,
            endLine: span.end_line,
            endCol: span.end_col,
            type,
        });
    }
    return ranges.sort((a, b) =>
        a.startLine === b.startLine ? a.startCol - b.startCol : a.startLine - b.startLine,
    );
}

export function instrsForAst(astId: number, snapshot: CompilerMappingSnapshot): number[] {
    return snapshot.byAst.get(astId) ?? [];
}

export function getAstIdsForInstruction(idx: number, snapshot: CompilerMappingSnapshot): number[] {
    const maps = snapshot.instrToMaps.get(idx);
    if (!maps) return [];
    return Array.from(new Set(maps.map(m => m.ast_node_id)));
}

export function pickPrimaryAst(astIds: number[], snapshot: CompilerMappingSnapshot): number | null {
    let best: { id: number; length: number } | null = null;
    for (const id of astIds) {
        const span = snapshot.spanById.get(id);
        if (!span) continue;
        const length = spanLength(span);
        if (!best || length < best.length) {
            best = { id, length };
        }
    }
    return best?.id ?? null;
}

export function astIdsWithSameSpan(astId: number, snapshot: CompilerMappingSnapshot): Set<number> {
    const result = new Set<number>();
    const ref = snapshot.spanById.get(astId);
    if (!ref) return result;
    for (const span of snapshot.astSpans) {
        if (span.start_byte === ref.start_byte && span.end_byte === ref.end_byte) {
            result.add(span.ast_node_id);
        }
    }
    return result;
}

function hasIrForAst(astId: number, snapshot: CompilerMappingSnapshot): boolean {
    const entries = snapshot.byAst.get(astId);
    return !!entries && entries.length > 0;
}

export function dominantBlockComponent(
    instrIndices: Set<number>,
    snapshot: CompilerMappingSnapshot,
): string | null {
    const counts = new Map<string, number>();
    for (const idx of instrIndices) {
        const maps = snapshot.instrToMaps.get(idx);
        if (!maps) continue;
        for (const mapping of maps) {
            const component = normalizeComponentName(mapping.component);
            if (!component || !BLOCK_COMPONENTS.has(component)) continue;
            counts.set(component, (counts.get(component) ?? 0) + 1);
        }
    }

    let best: string | null = null;
    let bestCount = 0;
    for (const [component, count] of counts.entries()) {
        if (count > bestCount) {
            best = component;
            bestCount = count;
        }
    }
    return best;
}

export function findInnermostControlContaining(
    byteStart: number,
    byteEnd: number,
    snapshot: CompilerMappingSnapshot,
): AstSpan | null {
    let best: AstSpan | null = null;
    for (const span of snapshot.astSpans) {
        if (!CONTROL_KINDS.has(span.kind)) continue;
        if (span.start_byte <= byteStart && byteEnd <= span.end_byte) {
            if (!best || spanLength(span) < spanLength(best)) {
                best = span;
            }
        }
    }
    return best;
}

export function collectBlockInstrIndices(
    astId: number,
    stmtSet: Set<number>,
    snapshot: CompilerMappingSnapshot,
): Set<number> {
    const blockSet = new Set<number>();
    const domComp = dominantBlockComponent(stmtSet, snapshot);
    if (!domComp) return blockSet;

    const span = snapshot.spanById.get(astId);
    if (!span) return blockSet;

    const ctrl = findInnermostControlContaining(span.start_byte, span.end_byte, snapshot);
    if (!ctrl) return blockSet;

    for (let i = 0; i < snapshot.totalInstructions; i++) {
        if (stmtSet.has(i)) continue;
        const maps = snapshot.instrToMaps.get(i);
        if (!maps) continue;
        for (const mapping of maps) {
            const component = normalizeComponentName(mapping.component);
            if (component !== domComp) continue;
            const mappedSpan = snapshot.spanById.get(mapping.ast_node_id);
            if (!mappedSpan) continue;
            if (mappedSpan.start_byte >= ctrl.start_byte && mappedSpan.end_byte <= ctrl.end_byte) {
                blockSet.add(i);
                break;
            }
        }
    }

    return blockSet;
}

export function collectComponentInstrSets(
    astId: number,
    stmtSet: Set<number>,
    snapshot: CompilerMappingSnapshot,
): Map<HighlightType, Set<number>> {
    const result = new Map<HighlightType, Set<number>>();

    const span = snapshot.spanById.get(astId);
    if (!span) return result;

    const ctrl = findInnermostControlContaining(span.start_byte, span.end_byte, snapshot);
    if (!ctrl) return result;

    for (let i = 0; i < snapshot.totalInstructions; i++) {
        if (stmtSet.has(i)) continue;
        const maps = snapshot.instrToMaps.get(i);
        if (!maps) continue;
        for (const mapping of maps) {
            const component = normalizeComponentName(mapping.component);
            if (!component || !ALL_COMPONENTS.has(component)) continue;
            const hlType = componentToHighlightType(component);
            if (!hlType) continue;
            const mappedSpan = snapshot.spanById.get(mapping.ast_node_id);
            if (!mappedSpan) continue;
            if (mappedSpan.start_byte >= ctrl.start_byte && mappedSpan.end_byte <= ctrl.end_byte) {
                let set = result.get(hlType);
                if (!set) { set = new Set(); result.set(hlType, set); }
                set.add(i);
                break;
            }
        }
    }

    return result;
}

export function collectBlockAstIds(
    primaryId: number,
    stmtIds: Set<number>,
    domComp: string | null,
    snapshot: CompilerMappingSnapshot,
): Set<number> {
    const result = new Set<number>();
    if (!domComp) return result;

    const primarySpan = snapshot.spanById.get(primaryId);
    if (!primarySpan) return result;

    const ctrl = findInnermostControlContaining(primarySpan.start_byte, primarySpan.end_byte, snapshot);
    if (!ctrl) return result;

    for (const mapping of snapshot.instrMappings) {
        const component = normalizeComponentName(mapping.component);
        if (component !== domComp) continue;
        const span = snapshot.spanById.get(mapping.ast_node_id);
        if (!span) continue;
        if (
            span.start_byte >= ctrl.start_byte &&
            span.end_byte <= ctrl.end_byte &&
            !stmtIds.has(mapping.ast_node_id)
        ) {
            result.add(mapping.ast_node_id);
        }
    }

    return result;
}

export function collectComponentAstIds(
    primaryId: number,
    stmtIds: Set<number>,
    snapshot: CompilerMappingSnapshot,
): Map<HighlightType, Set<number>> {
    const result = new Map<HighlightType, Set<number>>();

    const primarySpan = snapshot.spanById.get(primaryId);
    if (!primarySpan) return result;

    const ctrl = findInnermostControlContaining(primarySpan.start_byte, primarySpan.end_byte, snapshot);
    if (!ctrl) return result;

    for (const mapping of snapshot.instrMappings) {
        const component = normalizeComponentName(mapping.component);
        if (!component || !ALL_COMPONENTS.has(component)) continue;
        const hlType = componentToHighlightType(component);
        if (!hlType) continue;
        const span = snapshot.spanById.get(mapping.ast_node_id);
        if (!span) continue;
        if (
            span.start_byte >= ctrl.start_byte &&
            span.end_byte <= ctrl.end_byte &&
            !stmtIds.has(mapping.ast_node_id)
        ) {
            let set = result.get(hlType);
            if (!set) { set = new Set(); result.set(hlType, set); }
            set.add(mapping.ast_node_id);
        }
    }

    return result;
}

export { hasIrForAst };
