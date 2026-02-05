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
} from '@/services/highlighting/mappings';
import { makeSnapshot, makeCompilationResult } from '@/test/fixtures';

describe('buildLineHighlights', () => {
    it('marks statement lines as statement type', () => {
        const stmtSet = new Set([0, 1, 2]);
        const blockSet = new Set<number>();
        const result = buildLineHighlights(stmtSet, blockSet);
        expect(result).toEqual([
            { line: 0, type: 'statement' },
            { line: 1, type: 'statement' },
            { line: 2, type: 'statement' },
        ]);
    });

    it('marks block lines as block type', () => {
        const stmtSet = new Set<number>();
        const blockSet = new Set([3, 5]);
        const result = buildLineHighlights(stmtSet, blockSet);
        expect(result).toEqual([
            { line: 3, type: 'block' },
            { line: 5, type: 'block' },
        ]);
    });

    it('statement takes precedence over block for same line', () => {
        const stmtSet = new Set([1, 2]);
        const blockSet = new Set([2, 3]);
        const result = buildLineHighlights(stmtSet, blockSet);
        expect(result).toEqual([
            { line: 1, type: 'statement' },
            { line: 2, type: 'statement' },
            { line: 3, type: 'block' },
        ]);
    });

    it('returns sorted results', () => {
        const stmtSet = new Set([5, 1, 3]);
        const blockSet = new Set<number>();
        const result = buildLineHighlights(stmtSet, blockSet);
        const lines = result.map(h => h.line);
        expect(lines).toEqual([1, 3, 5]);
    });
});

describe('buildAsmLineHighlights', () => {
    it('returns empty for snapshot with no irToAsm mapping', () => {
        const snapshot = makeSnapshot();
        // Clear the map
        snapshot.irToAsm.clear();
        const result = buildAsmLineHighlights(new Set([0]), new Set(), snapshot);
        expect(result).toEqual([]);
    });

    it('maps IR instruction indices to ASM lines', () => {
        const snapshot = makeSnapshot();
        const stmtSet = new Set([0]);
        const blockSet = new Set<number>();
        const result = buildAsmLineHighlights(stmtSet, blockSet, snapshot);
        expect(result.some(h => h.line === 0 && h.type === 'statement')).toBe(true);
    });

    it('statement overrides block for same ASM line', () => {
        const snapshot = makeSnapshot();
        const stmtSet = new Set([4]);
        const blockSet = new Set([4]);
        const result = buildAsmLineHighlights(stmtSet, blockSet, snapshot);
        const line4Highlights = result.filter(h => h.line === 4 || h.line === 5);
        for (const h of line4Highlights) {
            expect(h.type).toBe('statement');
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
