import { CompilerMappingSnapshot, HighlightRange, LineHighlight } from '@/types/compiler.types';
import { PREFERRED_KINDS, containsPosition, resolveStmtHighlightType, spanLength } from './helpers';
import {
    instrsForAst,
    collectComponentInstrSets,
    buildLineHighlights,
    buildAsmLineHighlights,
    getAstIdsForInstruction,
    pickPrimaryAst,
    astIdsWithSameSpan,
    collectComponentAstIds,
    convertAstIdsToRanges,
    hasIrForAst,
} from './mappings';

export function pickAstIdForPosition(
    line: number,
    column: number,
    snapshot: CompilerMappingSnapshot,
): number | null {
    const candidates = snapshot.astSpans.filter(span => containsPosition(span, line, column));
    if (candidates.length === 0) return null;

    const hasIr = candidates.filter(span => hasIrForAst(span.ast_node_id, snapshot));
    const preferred = hasIr.filter(span => PREFERRED_KINDS.has(span.kind));
    const pool = preferred.length > 0 ? preferred : hasIr.length > 0 ? hasIr : candidates;

    pool.sort((a, b) => spanLength(a) - spanLength(b));
    return pool[0].ast_node_id;
}

export function collectIrHighlightsForAst(
    astId: number,
    snapshot: CompilerMappingSnapshot,
): { irLines: LineHighlight[]; asmLines: LineHighlight[] } {
    const stmtSet = new Set(instrsForAst(astId, snapshot));
    if (stmtSet.size === 0) return { irLines: [], asmLines: [] };

    const stmtType = resolveStmtHighlightType(stmtSet, snapshot);
    const componentSets = collectComponentInstrSets(astId, stmtSet, snapshot);
    return {
        irLines: buildLineHighlights(stmtSet, stmtType, componentSets),
        asmLines: buildAsmLineHighlights(stmtSet, stmtType, componentSets, snapshot),
    };
}

export function buildHighlightsForInstruction(
    instrIndex: number,
    snapshot: CompilerMappingSnapshot,
): { sourceRanges: HighlightRange[]; irLines: LineHighlight[]; asmLines: LineHighlight[] } {
    const astIds = getAstIdsForInstruction(instrIndex, snapshot);
    if (astIds.length === 0) return { sourceRanges: [], irLines: [], asmLines: [] };

    const primary = pickPrimaryAst(astIds, snapshot);
    if (primary == null) return { sourceRanges: [], irLines: [], asmLines: [] };

    const stmtIds = astIdsWithSameSpan(primary, snapshot);
    const stmtInstrs = new Set(instrsForAst(primary, snapshot));
    const stmtType = resolveStmtHighlightType(stmtInstrs, snapshot);
    const componentSets = collectComponentInstrSets(primary, stmtInstrs, snapshot);
    const irLines = buildLineHighlights(stmtInstrs, stmtType, componentSets);
    const asmLines = buildAsmLineHighlights(stmtInstrs, stmtType, componentSets, snapshot);

    const componentAstIds = collectComponentAstIds(primary, stmtIds, snapshot);

    const sourceRanges: HighlightRange[] = [
        ...convertAstIdsToRanges(stmtIds, stmtType, snapshot),
    ];

    for (const [type, ids] of componentAstIds) {
        sourceRanges.push(...convertAstIdsToRanges(ids, type, snapshot));
    }

    return { sourceRanges, irLines, asmLines };
}

export function buildHighlightsForAsmLine(
    asmLine: number,
    snapshot: CompilerMappingSnapshot,
): { sourceRanges: HighlightRange[]; irLines: LineHighlight[]; asmLines: LineHighlight[] } {
    if (snapshot.asmIrMapping.length === 0) return { sourceRanges: [], irLines: [], asmLines: [] };
    if (asmLine < 0 || asmLine >= snapshot.asmIrMapping.length) return { sourceRanges: [], irLines: [], asmLines: [] };

    const irIndex = snapshot.asmIrMapping[asmLine];
    if (typeof irIndex !== 'number') return { sourceRanges: [], irLines: [], asmLines: [] };

    return buildHighlightsForInstruction(irIndex, snapshot);
}
