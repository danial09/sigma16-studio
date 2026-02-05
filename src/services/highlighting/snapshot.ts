import { CompilationResult, InstrMapping, CompilerMappingSnapshot } from '@/types/compiler.types';
import { normalizeComponentName } from './helpers';

export function buildMappingSnapshot(result: CompilationResult | null): CompilerMappingSnapshot | null {
    if (!result || !result.success) return null;

    const astSpans = result.ast_spans ?? [];
    const spanById = new Map(astSpans.map(span => [span.ast_node_id, span] as const));
    const byAst = new Map((result.by_ast ?? []).map(group => [group.ast_node_id, group.instr_indices.slice()] as const));

    const instrMappings: InstrMapping[] = (result.instr_mappings ?? []).map(mapping => ({
        ...mapping,
        component: normalizeComponentName(mapping.component ?? null) ?? undefined,
    }));

    const instrToMaps = new Map<number, InstrMapping[]>();
    for (const mapping of instrMappings) {
        let list = instrToMaps.get(mapping.instr_index);
        if (!list) {
            list = [];
            instrToMaps.set(mapping.instr_index, list);
        }
        list.push(mapping);
    }

    const asmIrMappingRaw = result.asm_ir_mapping ?? [];
    const asmIrMapping: (number | null)[] = asmIrMappingRaw.map(value =>
        typeof value === 'number' ? value : value == null ? null : Number(value),
    );

    const irToAsm = new Map<number, number[]>();
    asmIrMapping.forEach((irIndex, asmLine) => {
        if (typeof irIndex !== 'number' || Number.isNaN(irIndex)) return;
        let list = irToAsm.get(irIndex);
        if (!list) {
            list = [];
            irToAsm.set(irIndex, list);
        }
        list.push(asmLine);
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
