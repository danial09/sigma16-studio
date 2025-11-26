import { AstSpan, CompilationResult, HighlightRange, InstrMapping, LineHighlight, CompilerMappingSnapshot } from '@/types/compiler.types';

const PREFERRED_KINDS = new Set(['Binary', 'Unary', 'Assign', 'If', 'While', 'For']);
const CONTROL_KINDS = new Set(['If', 'While', 'For']);
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
const BLOCK_COMPONENTS = new Set(['ThenBranch', 'ElseBranch', 'LoopBody']);

export function buildMappingSnapshot(result: CompilationResult | null): CompilerMappingSnapshot | null {
  if (!result || !result.success) {
    return null;
  }

  const astSpans = result.ast_spans ?? [];
  const spanById = new Map(astSpans.map((span) => [span.ast_node_id, span] as const));
  const byAst = new Map((result.by_ast ?? []).map((group) => [group.ast_node_id, group.instr_indices.slice()] as const));
  const instrMappings = (result.instr_mappings ?? []).map((mapping) => ({
    ...mapping,
    component: normalizeComponentName(mapping.component ?? null) ?? undefined,
  }));
  const instrToMaps = new Map<number, InstrMapping[]>();
  const asmIrMappingRaw = result.asm_ir_mapping ?? [];
  const asmIrMapping: (number | null)[] = asmIrMappingRaw.map((value) =>
    typeof value === 'number' ? value : value == null ? null : Number(value),
  );
  const irToAsm = new Map<number, number[]>();

  for (const mapping of instrMappings) {
    if (!instrToMaps.has(mapping.instr_index)) {
      instrToMaps.set(mapping.instr_index, []);
    }
    instrToMaps.get(mapping.instr_index)!.push(mapping);
  }

  asmIrMapping.forEach((irIndex, asmLine) => {
    if (typeof irIndex !== 'number' || Number.isNaN(irIndex)) {
      return;
    }
    if (!irToAsm.has(irIndex)) {
      irToAsm.set(irIndex, []);
    }
    irToAsm.get(irIndex)!.push(asmLine);
  });

  return {
    astSpans,
    spanById,
    byAst,
    instrMappings,
    instrToMaps,
    asmIrMapping,
    irToAsm,
    totalInstructions: result.ir?.length ?? 0,
    totalAsmLines: asmIrMapping.length,
  };
}

export function pickAstIdForPosition(
  line: number,
  column: number,
  snapshot: CompilerMappingSnapshot,
): number | null {
  const candidates = snapshot.astSpans.filter((span) => containsPosition(span, line, column));
  if (candidates.length === 0) {
    return null;
  }

  const hasIr = candidates.filter((span) => hasIrForAst(span.ast_node_id, snapshot));
  const preferred = hasIr.filter((span) => PREFERRED_KINDS.has(span.kind));
  const pool = preferred.length > 0 ? preferred : hasIr.length > 0 ? hasIr : candidates;

  pool.sort((a, b) => spanLength(a) - spanLength(b));
  return pool[0].ast_node_id;
}

export function collectIrHighlightsForAst(
  astId: number,
  snapshot: CompilerMappingSnapshot,
): { irLines: LineHighlight[]; asmLines: LineHighlight[] } {
  const stmtSet = new Set(instrsForAst(astId, snapshot));
  if (stmtSet.size === 0) {
    return { irLines: [], asmLines: [] };
  }

  const blockSet = collectBlockInstrIndices(astId, stmtSet, snapshot);
  return {
    irLines: buildLineHighlights(stmtSet, blockSet),
    asmLines: buildAsmLineHighlights(stmtSet, blockSet, snapshot),
  };
}

export function buildHighlightsForInstruction(
  instrIndex: number,
  snapshot: CompilerMappingSnapshot,
): { sourceRanges: HighlightRange[]; irLines: LineHighlight[]; asmLines: LineHighlight[] } {
  const astIds = getAstIdsForInstruction(instrIndex, snapshot);
  if (astIds.length === 0) {
    return { sourceRanges: [], irLines: [], asmLines: [] };
  }

  const primary = pickPrimaryAst(astIds, snapshot);
  if (primary == null) {
    return { sourceRanges: [], irLines: [], asmLines: [] };
  }

  const stmtIds = astIdsWithSameSpan(primary, snapshot);
  const stmtInstrs = new Set(instrsForAst(primary, snapshot));
  const blockInstrs = collectBlockInstrIndices(primary, stmtInstrs, snapshot);
  const irLines = buildLineHighlights(stmtInstrs, blockInstrs);
  const asmLines = buildAsmLineHighlights(stmtInstrs, blockInstrs, snapshot);

  const domComp = dominantBlockComponent(stmtInstrs, snapshot);
  const blockIds = collectBlockAstIds(primary, stmtIds, domComp, snapshot);

  const sourceRanges = [
    ...convertAstIdsToRanges(stmtIds, 'statement', snapshot),
    ...convertAstIdsToRanges(blockIds, 'block', snapshot),
  ];

  return { sourceRanges, irLines, asmLines };
}

export function buildHighlightsForAsmLine(
  asmLine: number,
  snapshot: CompilerMappingSnapshot,
): { sourceRanges: HighlightRange[]; irLines: LineHighlight[]; asmLines: LineHighlight[] } {
  if (snapshot.asmIrMapping.length === 0) {
    return { sourceRanges: [], irLines: [], asmLines: [] };
  }
  if (asmLine < 0 || asmLine >= snapshot.asmIrMapping.length) {
    return { sourceRanges: [], irLines: [], asmLines: [] };
  }
  const irIndex = snapshot.asmIrMapping[asmLine];
  if (typeof irIndex !== 'number') {
    return { sourceRanges: [], irLines: [], asmLines: [] };
  }
  return buildHighlightsForInstruction(irIndex, snapshot);
}

function convertAstIdsToRanges(
  ids: Iterable<number>,
  type: 'statement' | 'block',
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

function collectBlockAstIds(
  primaryId: number,
  stmtIds: Set<number>,
  domComp: string | null,
  snapshot: CompilerMappingSnapshot,
): Set<number> {
  const result = new Set<number>();
  if (!domComp) {
    return result;
  }

  const primarySpan = snapshot.spanById.get(primaryId);
  if (!primarySpan) {
    return result;
  }

  const ctrl = findInnermostControlContaining(primarySpan.start_byte, primarySpan.end_byte, snapshot);
  if (!ctrl) {
    return result;
  }

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

function collectBlockInstrIndices(
  astId: number,
  stmtSet: Set<number>,
  snapshot: CompilerMappingSnapshot,
): Set<number> {
  const blockSet = new Set<number>();
  const domComp = dominantBlockComponent(stmtSet, snapshot);
  if (!domComp) {
    return blockSet;
  }

  const span = snapshot.spanById.get(astId);
  if (!span) {
    return blockSet;
  }

  const ctrl = findInnermostControlContaining(span.start_byte, span.end_byte, snapshot);
  if (!ctrl) {
    return blockSet;
  }

  for (let i = 0; i < snapshot.totalInstructions; i++) {
    if (stmtSet.has(i)) continue;
    const maps = snapshot.instrToMaps.get(i);
    if (!maps) continue;
    for (const mapping of maps) {
      const component = normalizeComponentName(mapping.component);
      if (component !== domComp) continue;
      const mappedSpan = snapshot.spanById.get(mapping.ast_node_id);
      if (!mappedSpan) continue;
      if (
        mappedSpan.start_byte >= ctrl.start_byte &&
        mappedSpan.end_byte <= ctrl.end_byte
      ) {
        blockSet.add(i);
        break;
      }
    }
  }

  return blockSet;
}

function buildLineHighlights(
  stmtSet: Set<number>,
  blockSet: Set<number>,
): LineHighlight[] {
  const highlights: LineHighlight[] = [];
  const stmtLines = Array.from(stmtSet).sort((a, b) => a - b);
  for (const line of stmtLines) {
    highlights.push({ line, type: 'statement' });
    blockSet.delete(line);
  }

  const blockLines = Array.from(blockSet).sort((a, b) => a - b);
  for (const line of blockLines) {
    highlights.push({ line, type: 'block' });
  }

  return highlights;
}

function buildAsmLineHighlights(
  stmtSet: Set<number>,
  blockSet: Set<number>,
  snapshot: CompilerMappingSnapshot,
): LineHighlight[] {
  if (!snapshot.irToAsm.size) {
    return [];
  }

  const lineKinds = new Map<number, LineHighlight['type']>();

  for (const idx of blockSet) {
    const asmLines = snapshot.irToAsm.get(idx);
    if (!asmLines) continue;
    for (const line of asmLines) {
      if (!lineKinds.has(line)) {
        lineKinds.set(line, 'block');
      }
    }
  }

  for (const idx of stmtSet) {
    const asmLines = snapshot.irToAsm.get(idx);
    if (!asmLines) continue;
    for (const line of asmLines) {
      lineKinds.set(line, 'statement');
    }
  }

  return Array.from(lineKinds.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([line, type]) => ({ line, type }));
}

function getAstIdsForInstruction(
  idx: number,
  snapshot: CompilerMappingSnapshot,
): number[] {
  const maps = snapshot.instrToMaps.get(idx);
  if (!maps) return [];
  return Array.from(new Set(maps.map((m) => m.ast_node_id)));
}

function pickPrimaryAst(astIds: number[], snapshot: CompilerMappingSnapshot): number | null {
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

function astIdsWithSameSpan(astId: number, snapshot: CompilerMappingSnapshot): Set<number> {
  const result = new Set<number>();
  const ref = snapshot.spanById.get(astId);
  if (!ref) {
    return result;
  }
  for (const span of snapshot.astSpans) {
    if (
      span.start_byte === ref.start_byte &&
      span.end_byte === ref.end_byte
    ) {
      result.add(span.ast_node_id);
    }
  }
  return result;
}

function instrsForAst(astId: number, snapshot: CompilerMappingSnapshot): number[] {
  return snapshot.byAst.get(astId) ?? [];
}

function dominantBlockComponent(
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

function findInnermostControlContaining(
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

function containsPosition(span: AstSpan, line: number, column: number): boolean {
  if (line < span.start_line || line > span.end_line) {
    return false;
  }
  if (line === span.start_line && column < span.start_col) {
    return false;
  }
  if (line === span.end_line && column >= span.end_col) {
    return false;
  }
  return true;
}

function hasIrForAst(astId: number, snapshot: CompilerMappingSnapshot): boolean {
  const entries = snapshot.byAst.get(astId);
  return !!entries && entries.length > 0;
}

function spanLength(span: AstSpan): number {
  return Math.max(0, span.end_byte - span.start_byte);
}

function normalizeComponentName(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  return COMPONENT_NORMALIZATION[value] ?? value;
}
