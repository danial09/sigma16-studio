import { describe, it, expect } from 'vitest';
import { containsPosition, spanLength, normalizeComponentName, componentToHighlightType, resolveStmtHighlightType, PREFERRED_KINDS, CONTROL_KINDS, BLOCK_COMPONENTS, ALL_COMPONENTS } from '@/services/highlighting/helpers';
import { makeSpan, makeSnapshot } from '@/test/fixtures';

describe('containsPosition', () => {
    const span = makeSpan({
        ast_node_id: 1,
        kind: 'Assign',
        start_line: 2,
        start_col: 4,
        end_line: 5,
        end_col: 10,
        start_byte: 20,
        end_byte: 50,
    });

    it('returns true for position inside span', () => {
        expect(containsPosition(span, 3, 0)).toBe(true);
    });

    it('returns true for position at start of span', () => {
        expect(containsPosition(span, 2, 4)).toBe(true);
    });

    it('returns false for position before start column on start line', () => {
        expect(containsPosition(span, 2, 3)).toBe(false);
    });

    it('returns false for position at end column on end line (exclusive)', () => {
        expect(containsPosition(span, 5, 10)).toBe(false);
    });

    it('returns true for position just before end column on end line', () => {
        expect(containsPosition(span, 5, 9)).toBe(true);
    });

    it('returns false for position on line before span', () => {
        expect(containsPosition(span, 1, 5)).toBe(false);
    });

    it('returns false for position on line after span', () => {
        expect(containsPosition(span, 6, 0)).toBe(false);
    });

    it('handles single-line span', () => {
        const singleLine = makeSpan({
            ast_node_id: 2,
            kind: 'Binary',
            start_line: 5,
            start_col: 3,
            end_line: 5,
            end_col: 8,
            start_byte: 0,
            end_byte: 5,
        });

        expect(containsPosition(singleLine, 5, 3)).toBe(true);
        expect(containsPosition(singleLine, 5, 7)).toBe(true);
        expect(containsPosition(singleLine, 5, 8)).toBe(false);
        expect(containsPosition(singleLine, 5, 2)).toBe(false);
    });
});

describe('spanLength', () => {
    it('calculates byte length of span', () => {
        const span = makeSpan({ ast_node_id: 1, kind: 'Assign', start_byte: 10, end_byte: 25 });
        expect(spanLength(span)).toBe(15);
    });

    it('returns 0 for zero-length span', () => {
        const span = makeSpan({ ast_node_id: 1, kind: 'Assign', start_byte: 5, end_byte: 5 });
        expect(spanLength(span)).toBe(0);
    });

    it('returns 0 for inverted span (defensive)', () => {
        const span = makeSpan({ ast_node_id: 1, kind: 'Assign', start_byte: 10, end_byte: 5 });
        expect(spanLength(span)).toBe(0);
    });
});

describe('normalizeComponentName', () => {
    it('normalizes lowercase to canonical form', () => {
        expect(normalizeComponentName('thenBranch')).toBe('ThenBranch');
        expect(normalizeComponentName('elseBranch')).toBe('ElseBranch');
        expect(normalizeComponentName('loopBody')).toBe('LoopBody');
        expect(normalizeComponentName('condition')).toBe('Condition');
        expect(normalizeComponentName('controlFlowGlue')).toBe('ControlFlowGlue');
    });

    it('preserves already normalized names', () => {
        expect(normalizeComponentName('ThenBranch')).toBe('ThenBranch');
        expect(normalizeComponentName('ElseBranch')).toBe('ElseBranch');
        expect(normalizeComponentName('LoopBody')).toBe('LoopBody');
    });

    it('passes through unknown component names', () => {
        expect(normalizeComponentName('CustomComponent')).toBe('CustomComponent');
    });

    it('returns null for null/undefined/empty', () => {
        expect(normalizeComponentName(null)).toBeNull();
        expect(normalizeComponentName(undefined)).toBeNull();
        expect(normalizeComponentName('')).toBeNull();
    });
});

describe('constants', () => {
    it('PREFERRED_KINDS contains expected values', () => {
        expect(PREFERRED_KINDS.has('Binary')).toBe(true);
        expect(PREFERRED_KINDS.has('Unary')).toBe(true);
        expect(PREFERRED_KINDS.has('Assign')).toBe(true);
        expect(PREFERRED_KINDS.has('If')).toBe(true);
        expect(PREFERRED_KINDS.has('While')).toBe(true);
        expect(PREFERRED_KINDS.has('For')).toBe(true);
    });

    it('CONTROL_KINDS contains expected values', () => {
        expect(CONTROL_KINDS.has('If')).toBe(true);
        expect(CONTROL_KINDS.has('While')).toBe(true);
        expect(CONTROL_KINDS.has('For')).toBe(true);
        expect(CONTROL_KINDS.has('Assign')).toBe(false);
    });

    it('BLOCK_COMPONENTS contains expected values', () => {
        expect(BLOCK_COMPONENTS.has('ThenBranch')).toBe(true);
        expect(BLOCK_COMPONENTS.has('ElseBranch')).toBe(true);
        expect(BLOCK_COMPONENTS.has('LoopBody')).toBe(true);
        expect(BLOCK_COMPONENTS.has('Condition')).toBe(false);
    });

    it('ALL_COMPONENTS contains all component types', () => {
        expect(ALL_COMPONENTS.has('Condition')).toBe(true);
        expect(ALL_COMPONENTS.has('ThenBranch')).toBe(true);
        expect(ALL_COMPONENTS.has('ElseBranch')).toBe(true);
        expect(ALL_COMPONENTS.has('LoopBody')).toBe(true);
        expect(ALL_COMPONENTS.has('ControlFlowGlue')).toBe(true);
    });
});

describe('componentToHighlightType', () => {
    it('maps known components to highlight types', () => {
        expect(componentToHighlightType('Condition')).toBe('condition');
        expect(componentToHighlightType('ThenBranch')).toBe('then-branch');
        expect(componentToHighlightType('ElseBranch')).toBe('else-branch');
        expect(componentToHighlightType('LoopBody')).toBe('loop-body');
        expect(componentToHighlightType('ControlFlowGlue')).toBe('control-glue');
    });

    it('returns null for unknown components', () => {
        expect(componentToHighlightType('Unknown')).toBeNull();
    });

    it('returns null for null input', () => {
        expect(componentToHighlightType(null)).toBeNull();
    });
});

describe('resolveStmtHighlightType', () => {
    it('returns statement for instructions with no component', () => {
        const snapshot = makeSnapshot();
        // Instructions 0, 1 (AST 1 Assign x=5) have no component
        expect(resolveStmtHighlightType(new Set([0, 1]), snapshot)).toBe('statement');
    });

    it('returns condition for Condition-tagged instructions', () => {
        const snapshot = makeSnapshot();
        // Instruction 4 has component 'Condition'
        expect(resolveStmtHighlightType(new Set([4]), snapshot)).toBe('condition');
    });

    it('returns then-branch for ThenBranch-tagged instructions', () => {
        const snapshot = makeSnapshot();
        // Instructions 7, 8 have component 'ThenBranch'
        expect(resolveStmtHighlightType(new Set([7, 8]), snapshot)).toBe('then-branch');
    });

    it('returns control-glue for ControlFlowGlue-tagged instructions', () => {
        const snapshot = makeSnapshot();
        // Instructions 5, 6 have component 'ControlFlowGlue'
        expect(resolveStmtHighlightType(new Set([5, 6]), snapshot)).toBe('control-glue');
    });

    it('returns statement for empty set', () => {
        const snapshot = makeSnapshot();
        expect(resolveStmtHighlightType(new Set(), snapshot)).toBe('statement');
    });
});
