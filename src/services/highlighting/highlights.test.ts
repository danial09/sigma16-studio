import { describe, it, expect } from 'vitest';
import {
    pickAstIdForPosition,
    collectIrHighlightsForAst,
    buildHighlightsForInstruction,
    buildHighlightsForAsmLine,
} from '@/services/highlighting/highlights';
import { makeSnapshot } from '@/test/fixtures';

describe('pickAstIdForPosition', () => {
    it('returns AST id for position inside a span', () => {
        const snapshot = makeSnapshot();
        // Line 0, col 3 should be inside AST 1 (Assign: x = 5)
        const id = pickAstIdForPosition(0, 3, snapshot);
        expect(id).toBe(1);
    });

    it('returns null for position outside all spans', () => {
        const snapshot = makeSnapshot();
        const id = pickAstIdForPosition(100, 0, snapshot);
        expect(id).toBeNull();
    });

    it('prefers shorter spans (more specific AST nodes)', () => {
        const snapshot = makeSnapshot();
        // Line 2, col 5 is inside both AST 3 (If) and AST 4 (Binary x < y)
        // Should prefer the smaller Binary node
        const id = pickAstIdForPosition(2, 5, snapshot);
        expect(id).toBe(4);
    });

    it('prefers nodes with IR instructions', () => {
        const snapshot = makeSnapshot();
        // AST 1 has IR, so should be returned even if other spans contain the position
        const id = pickAstIdForPosition(0, 0, snapshot);
        expect(id).toBe(1);
    });
});

describe('collectIrHighlightsForAst', () => {
    it('returns IR and ASM highlights for an AST node', () => {
        const snapshot = makeSnapshot();
        const { irLines, asmLines } = collectIrHighlightsForAst(1, snapshot);

        expect(irLines.length).toBeGreaterThan(0);
        expect(irLines[0].type).toBe('statement');

        // AST 1 maps to IR 0,1 which maps to ASM 0,1
        const irLineNums = irLines.map(h => h.line);
        expect(irLineNums).toContain(0);
        expect(irLineNums).toContain(1);
    });

    it('returns empty for AST with no IR instructions', () => {
        const snapshot = makeSnapshot();
        const { irLines, asmLines } = collectIrHighlightsForAst(999, snapshot);
        expect(irLines).toEqual([]);
        expect(asmLines).toEqual([]);
    });

    it('returns ASM highlights corresponding to IR lines', () => {
        const snapshot = makeSnapshot();
        const { asmLines } = collectIrHighlightsForAst(1, snapshot);
        const asmLineNums = asmLines.map(h => h.line);
        expect(asmLineNums).toContain(0);
        expect(asmLineNums).toContain(1);
    });
});

describe('buildHighlightsForInstruction', () => {
    it('returns source ranges, IR and ASM highlights', () => {
        const snapshot = makeSnapshot();
        const result = buildHighlightsForInstruction(0, snapshot);
        expect(result.sourceRanges.length).toBeGreaterThan(0);
        expect(result.irLines.length).toBeGreaterThan(0);
    });

    it('returns empty for unmapped instruction', () => {
        const snapshot = makeSnapshot();
        const result = buildHighlightsForInstruction(999, snapshot);
        expect(result.sourceRanges).toEqual([]);
        expect(result.irLines).toEqual([]);
        expect(result.asmLines).toEqual([]);
    });

    it('source ranges have correct type', () => {
        const snapshot = makeSnapshot();
        const result = buildHighlightsForInstruction(0, snapshot);
        for (const range of result.sourceRanges) {
            expect(['statement', 'block']).toContain(range.type);
        }
    });
});

describe('buildHighlightsForAsmLine', () => {
    it('delegates to buildHighlightsForInstruction via IR mapping', () => {
        const snapshot = makeSnapshot();
        // ASM line 0 maps to IR 0
        const result = buildHighlightsForAsmLine(0, snapshot);
        expect(result.sourceRanges.length).toBeGreaterThan(0);
        expect(result.irLines.length).toBeGreaterThan(0);
    });

    it('returns empty for out-of-range ASM line', () => {
        const snapshot = makeSnapshot();
        const result = buildHighlightsForAsmLine(-1, snapshot);
        expect(result.sourceRanges).toEqual([]);

        const result2 = buildHighlightsForAsmLine(9999, snapshot);
        expect(result2.sourceRanges).toEqual([]);
    });

    it('returns empty when asm_ir_mapping is empty', () => {
        const snapshot = makeSnapshot({ asm_ir_mapping: [] });
        const result = buildHighlightsForAsmLine(0, snapshot);
        expect(result.sourceRanges).toEqual([]);
    });

    it('returns empty for null-mapped ASM line', () => {
        const snapshot = makeSnapshot({ asm_ir_mapping: [null, 0, null] });
        const result = buildHighlightsForAsmLine(0, snapshot);
        expect(result.sourceRanges).toEqual([]);
    });
});
