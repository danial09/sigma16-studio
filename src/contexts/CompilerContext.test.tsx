import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CompilerProvider, useCompiler } from '@/contexts/CompilerContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import React from 'react';

function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
        SettingsProvider,
        null,
        React.createElement(CompilerProvider, null, children),
    );
}

describe('CompilerContext', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('provides initial state with default source', () => {
        const { result } = renderHook(() => useCompiler(), { wrapper });
        expect(result.current.state.source).toContain('x = 5');
        expect(result.current.state.isCompiling).toBe(false);
        expect(result.current.state.result).toBeNull();
        expect(result.current.state.error).toBeNull();
    });

    it('provides default compiler options', () => {
        const { result } = renderHook(() => useCompiler(), { wrapper });
        expect(result.current.state.options.emitAsm).toBe(true);
        expect(result.current.state.options.allocator).toBe('basic');
    });

    it('updateSource updates the source code', () => {
        const { result } = renderHook(() => useCompiler(), { wrapper });

        act(() => {
            result.current.updateSource('new code');
        });

        expect(result.current.state.source).toBe('new code');
    });

    it('updateOptions merges partial options', () => {
        const { result } = renderHook(() => useCompiler(), { wrapper });

        act(() => {
            result.current.updateOptions({ allocator: 'advanced' });
        });

        expect(result.current.state.options.allocator).toBe('advanced');
        expect(result.current.state.options.emitAsm).toBe(true);
    });

    it('setSourceHighlights updates highlights', () => {
        const { result } = renderHook(() => useCompiler(), { wrapper });
        const highlights = [{ startLine: 0, startCol: 0, endLine: 0, endCol: 5, type: 'statement' as const }];

        act(() => {
            result.current.setSourceHighlights(highlights);
        });

        expect(result.current.state.sourceHighlights).toEqual(highlights);
    });

    it('setIrHighlights updates highlights', () => {
        const { result } = renderHook(() => useCompiler(), { wrapper });
        const highlights = [{ line: 0, type: 'statement' as const }];

        act(() => {
            result.current.setIrHighlights(highlights);
        });

        expect(result.current.state.irHighlights).toEqual(highlights);
    });

    it('setAsmHighlights updates highlights', () => {
        const { result } = renderHook(() => useCompiler(), { wrapper });
        const highlights = [{ line: 0, type: 'block' as const }];

        act(() => {
            result.current.setAsmHighlights(highlights);
        });

        expect(result.current.state.asmHighlights).toEqual(highlights);
    });

    it('compile sets isCompiling and then result', async () => {
        const { result } = renderHook(() => useCompiler(), { wrapper });

        await act(async () => {
            await result.current.compile();
        });

        expect(result.current.state.isCompiling).toBe(false);
        expect(result.current.state.result).toBeDefined();
        expect(result.current.state.result?.success).toBe(true);
    });

    it('compile clears highlights after compilation', async () => {
        const { result } = renderHook(() => useCompiler(), { wrapper });

        // Set some highlights first
        act(() => {
            result.current.setIrHighlights([{ line: 0, type: 'statement' }]);
        });

        await act(async () => {
            await result.current.compile();
        });

        expect(result.current.state.irHighlights).toEqual([]);
        expect(result.current.state.asmHighlights).toEqual([]);
        expect(result.current.state.sourceHighlights).toEqual([]);
    });

    it('loads persisted options from localStorage', () => {
        localStorage.setItem('sigma16_options', JSON.stringify({
            emitAsm: false,
            allocator: 'advanced',
        }));

        const { result } = renderHook(() => useCompiler(), { wrapper });
        expect(result.current.state.options.emitAsm).toBe(false);
        expect(result.current.state.options.allocator).toBe('advanced');
    });

    it('throws when used outside provider', () => {
        expect(() => {
            renderHook(() => useCompiler());
        }).toThrow('useCompiler must be used within CompilerProvider');
    });
});
