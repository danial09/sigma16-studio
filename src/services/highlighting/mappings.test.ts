import { describe, it, expect } from 'vitest';
import {
    buildLineHighlights,
    buildAsmLineHighlights,
    convertAstIdsToRanges,
    instrsForAst,
    getAstIdsForInstruction,
    pickPrimaryAst,
    astIdsWithSameSpan,
    dominantBlockComponent,
    collectBlockInstrIndices,
    collectComponentInstrSets,
    collectComponentAstIds,
} from '@/services/highlighting/mappings';
import { HighlightType } from '@/types/compiler.types';
import { makeSnapshot } from '@/test/fixtures';

describe('buildLineHighlights', () => {
    it('marks statement lines as statement type', () => {
        const stmtSet = new Set([0, 1, 2]);
        const componentSets = new Map<HighlightType, Set<number>>();
        const result = buildLineHighlights(stmtSet, 'statement', componentSets);
        expect(result).toEqual([
            { line: 0, type: 'statement' },
            { line: 1, type: 'statement' },
            { line: 2, type: 'statement' },
        ]);
    });

    it('marks component lines with their component type', () => {
        const stmtSet = new Set<number>();
        const componentSets = new Map<HighlightType, Set<number>>([
            ['condition', new Set([3, 5])],
        ]);
        const result = buildLineHighlights(stmtSet, 'statement', componentSets);
        expect(result).toEqual([
            { line: 3, type: 'condition' },
            { line: 5, type: 'condition' },
        ]);
    });

    it('statement uses its resolved component type', () => {
        const stmtSet = new Set([1, 2]);
        const componentSets = new Map<HighlightType, Set<number>>([
            ['else-branch', new Set([3])],
        ]);
        const result = buildLineHighlights(stmtSet, 'then-branch', componentSets);
        expect(result).toEqual([
            { line: 1, type: 'then-branch' },
            { line: 2, type: 'then-branch' },
            { line: 3, type: 'else-branch' },
        ]);
    });

    it('statement type takes precedence over component for same line', () => {
        const stmtSet = new Set([2]);
        const componentSets = new Map<HighlightType, Set<number>>([
            ['condition', new Set([2, 3])],
        ]);
        const result = buildLineHighlights(stmtSet, 'then-branch', componentSets);
        expect(result).toEqual([
            { line: 2, type: 'then-branch' },
            { line: 3, type: 'condition' },
        ]);
    });

    it('returns sorted results', () => {
        const stmtSet = new Set([5, 1, 3]);
        const componentSets = new Map<HighlightType, Set<number>>();
        const result = buildLineHighlights(stmtSet, 'statement', componentSets);
        const lines = result.map(h => h.line);
        expect(lines).toEqual([1, 3, 5]);
    });

    it('supports multiple component types simultaneously', () => {
        const stmtSet = new Set<number>();
        const componentSets = new Map<HighlightType, Set<number>>([
            ['condition', new Set([0])],
            ['then-branch', new Set([1])],
            ['else-branch', new Set([2])],
        ]);
        const result = buildLineHighlights(stmtSet, 'statement', componentSets);
        expect(result).toEqual([
            { line: 0, type: 'condition' },
            { line: 1, type: 'then-branch' },
            { line: 2, type: 'else-branch' },
        ]);
    });
});

describe('buildAsmLineHighlights', () => {
    it('returns empty for snapshot with no irToAsm mapping', () => {
        const snapshot = makeSnapshot();
        // Clear the map
        snapshot.irToAsm.clear();
        const result = buildAsmLineHighlights(new Set([0]), 'statement', new Map(), snapshot);
        expect(result).toEqual([]);
    });

    it('maps IR instruction indices to ASM lines', () => {
        const snapshot = makeSnapshot();
        const stmtSet = new Set([0]);
        const componentSets = new Map<HighlightType, Set<number>>();
        const result = buildAsmLineHighlights(stmtSet, 'statement', componentSets, snapshot);
        expect(result.some(h => h.line === 0 && h.type === 'statement')).toBe(true);
    });

    it('statement type overrides component for same ASM line', () => {
        const snapshot = makeSnapshot();
        const stmtSet = new Set([4]);
        const componentSets = new Map<HighlightType, Set<number>>([
            ['condition', new Set([4])],
        ]);
        const result = buildAsmLineHighlights(stmtSet, 'condition', componentSets, snapshot);
        const line4Highlights = result.filter(h => h.line === 4 || h.line === 5);
        for (const h of line4Highlights) {
            expect(h.type).toBe('condition');
        }
    });
});

describe('convertAstIdsToRanges', () => {
    it('converts AST IDs to highlight ranges', () => {
        const snapshot = makeSnapshot();
        const ranges = convertAstIdsToRanges([1], 'statement', snapshot);
        expect(ranges.length).toBe(1);
        expect(ranges[0].type).toBe('statement');
        expect(ranges[0].startLine).toBe(0);
    });

    it('skips unknown AST IDs', () => {
        const snapshot = makeSnapshot();
        const ranges = convertAstIdsToRanges([999], 'block', snapshot);
        expect(ranges).toEqual([]);
    });

    it('sorts ranges by line then column', () => {
        const snapshot = makeSnapshot();
        const ranges = convertAstIdsToRanges([2, 1], 'statement', snapshot);
        expect(ranges[0].startLine).toBeLessThanOrEqual(ranges[1].startLine);
    });
});

describe('instrsForAst', () => {
    it('returns instruction indices for a given AST id', () => {
        const snapshot = makeSnapshot();
        expect(instrsForAst(1, snapshot)).toEqual([0, 1]);
    });

    it('returns empty array for unknown AST id', () => {
        const snapshot = makeSnapshot();
        expect(instrsForAst(999, snapshot)).toEqual([]);
    });
});

describe('getAstIdsForInstruction', () => {
    it('returns AST ids mapped to an instruction', () => {
        const snapshot = makeSnapshot();
        const ids = getAstIdsForInstruction(0, snapshot);
        expect(ids).toContain(1);
    });

    it('returns empty for unmapped instruction', () => {
        const snapshot = makeSnapshot();
        const ids = getAstIdsForInstruction(999, snapshot);
        expect(ids).toEqual([]);
    });
});

describe('pickPrimaryAst', () => {
    it('picks the AST node with the shortest span', () => {
        const snapshot = makeSnapshot();
        // AST 4 (Binary, 5 bytes) is shorter than AST 3 (If, 45 bytes)
        const primary = pickPrimaryAst([3, 4], snapshot);
        expect(primary).toBe(4);
    });

    it('returns null when no AST ids have spans', () => {
        const snapshot = makeSnapshot();
        expect(pickPrimaryAst([999], snapshot)).toBeNull();
    });

    it('returns null for empty array', () => {
        const snapshot = makeSnapshot();
        expect(pickPrimaryAst([], snapshot)).toBeNull();
    });
});

describe('astIdsWithSameSpan', () => {
    it('finds AST nodes sharing the same byte span', () => {
        const snapshot = makeSnapshot();
        const ids = astIdsWithSameSpan(1, snapshot);
        expect(ids.has(1)).toBe(true);
    });

    it('returns empty set for unknown AST id', () => {
        const snapshot = makeSnapshot();
        const ids = astIdsWithSameSpan(999, snapshot);
        expect(ids.size).toBe(0);
    });
});

describe('dominantBlockComponent', () => {
    it('returns the most common block component among instructions', () => {
        const snapshot = makeSnapshot();
        // Instructions 7 and 8 have ThenBranch component
        const result = dominantBlockComponent(new Set([7, 8]), snapshot);
        expect(result).toBe('ThenBranch');
    });

    it('returns null when no block components found', () => {
        const snapshot = makeSnapshot();
        // Instructions 0 and 1 have no block component
        const result = dominantBlockComponent(new Set([0, 1]), snapshot);
        expect(result).toBeNull();
    });
});

describe('collectBlockInstrIndices', () => {
    it('returns empty set when no dominant component', () => {
        const snapshot = makeSnapshot();
        // AST 1 (Assign) has no block component
        const result = collectBlockInstrIndices(1, new Set([0, 1]), snapshot);
        expect(result.size).toBe(0);
    });
});

describe('collectComponentInstrSets', () => {
    it('returns empty map when AST has no enclosing control structure', () => {
        const snapshot = makeSnapshot();
        // AST 1 (Assign x=5) is not inside a control structure
        const result = collectComponentInstrSets(1, new Set([0, 1]), snapshot);
        expect(result.size).toBe(0);
    });

    it('collects instructions by component type for control structure', () => {
        const snapshot = makeSnapshot();
        // AST 5 (Assign z = x + y) is inside the If block (AST 3)
        // Its instructions are 7, 8 (ThenBranch)
        const stmtSet = new Set([7, 8]);
        const result = collectComponentInstrSets(5, stmtSet, snapshot);
        // Should find condition (instr 4) and control-glue (instr 5, 6)
        expect(result.has('condition') || result.has('control-glue')).toBe(true);
    });

    it('excludes statement instructions from component sets', () => {
        const snapshot = makeSnapshot();
        const stmtSet = new Set([7, 8]);
        const result = collectComponentInstrSets(5, stmtSet, snapshot);
        for (const [, indices] of result) {
            expect(indices.has(7)).toBe(false);
            expect(indices.has(8)).toBe(false);
        }
    });
});

describe('collectComponentAstIds', () => {
    it('returns empty map when no enclosing control structure', () => {
        const snapshot = makeSnapshot();
        const result = collectComponentAstIds(1, new Set([1]), snapshot);
        expect(result.size).toBe(0);
    });

    it('collects AST IDs by component for control structure', () => {
        const snapshot = makeSnapshot();
        // AST 5 inside If block
        const result = collectComponentAstIds(5, new Set([5]), snapshot);
        // Should find other components of the If block
        expect(result.size).toBeGreaterThan(0);
    });

    it('excludes statement AST IDs from component sets', () => {
        const snapshot = makeSnapshot();
        const stmtIds = new Set([5]);
        const result = collectComponentAstIds(5, stmtIds, snapshot);
        for (const [, ids] of result) {
            expect(ids.has(5)).toBe(false);
        }
    });
});
