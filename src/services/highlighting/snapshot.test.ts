import { describe, it, expect } from 'vitest';
import { buildMappingSnapshot } from '@/services/highlighting/snapshot';
import { makeCompilationResult } from '@/test/fixtures';

describe('buildMappingSnapshot', () => {
    it('returns null for null input', () => {
        expect(buildMappingSnapshot(null)).toBeNull();
    });

    it('returns null for failed compilation', () => {
        const result = makeCompilationResult({ success: false, error: 'parse error' });
        expect(buildMappingSnapshot(result)).toBeNull();
    });

    it('builds spanById map from ast_spans', () => {
        const snapshot = buildMappingSnapshot(makeCompilationResult())!;
        expect(snapshot.spanById.size).toBe(5);
        expect(snapshot.spanById.get(1)?.kind).toBe('Assign');
        expect(snapshot.spanById.get(3)?.kind).toBe('If');
    });

    it('builds byAst map from by_ast groups', () => {
        const snapshot = buildMappingSnapshot(makeCompilationResult())!;
        expect(snapshot.byAst.get(1)).toEqual([0, 1]);
        expect(snapshot.byAst.get(2)).toEqual([2, 3]);
    });

    it('normalizes component names in instrMappings', () => {
        const snapshot = buildMappingSnapshot(makeCompilationResult())!;
        const conditionMappings = snapshot.instrMappings.filter(m => m.component === 'Condition');
        expect(conditionMappings.length).toBeGreaterThan(0);
    });

    it('builds instrToMaps index', () => {
        const snapshot = buildMappingSnapshot(makeCompilationResult())!;
        const mapsFor0 = snapshot.instrToMaps.get(0);
        expect(mapsFor0).toBeDefined();
        expect(mapsFor0!.length).toBe(1);
        expect(mapsFor0![0].ast_node_id).toBe(1);
    });

    it('builds irToAsm mapping', () => {
        const snapshot = buildMappingSnapshot(makeCompilationResult())!;
        expect(snapshot.irToAsm.get(0)).toEqual([0]);
        expect(snapshot.irToAsm.get(1)).toEqual([1]);
        expect(snapshot.irToAsm.get(4)).toEqual([4, 5]);
    });

    it('computes totalInstructions from IR length', () => {
        const snapshot = buildMappingSnapshot(makeCompilationResult())!;
        expect(snapshot.totalInstructions).toBe(13);
    });

    it('computes totalAsmLines from asm_ir_mapping length', () => {
        const snapshot = buildMappingSnapshot(makeCompilationResult())!;
        expect(snapshot.totalAsmLines).toBe(7);
    });

    it('handles missing optional fields gracefully', () => {
        const result = makeCompilationResult({
            ast_spans: undefined,
            instr_mappings: undefined,
            by_ast: undefined,
            asm_ir_mapping: undefined,
        });
        const snapshot = buildMappingSnapshot(result)!;
        expect(snapshot.astSpans).toEqual([]);
        expect(snapshot.instrMappings).toEqual([]);
        expect(snapshot.byAst.size).toBe(0);
        expect(snapshot.asmIrMapping).toEqual([]);
    });

    it('handles null values in asm_ir_mapping', () => {
        const result = makeCompilationResult({
            asm_ir_mapping: [0, null, 2, null],
        });
        const snapshot = buildMappingSnapshot(result)!;
        expect(snapshot.asmIrMapping).toEqual([0, null, 2, null]);
        expect(snapshot.irToAsm.get(0)).toEqual([0]);
        expect(snapshot.irToAsm.get(2)).toEqual([2]);
    });
});
