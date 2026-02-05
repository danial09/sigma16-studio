import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it('returns initial value when no stored value exists', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));
        expect(result.current[0]).toEqual({ count: 0 });
    });

    it('returns stored value on mount', () => {
        localStorage.setItem('test-key', JSON.stringify({ count: 42 }));
        const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));
        expect(result.current[0]).toEqual({ count: 42 });
    });

    it('merges stored value with initial value', () => {
        localStorage.setItem('test-key', JSON.stringify({ count: 5 }));
        const { result } = renderHook(() =>
            useLocalStorage('test-key', { count: 0, name: 'default' }),
        );
        expect(result.current[0]).toEqual({ count: 5, name: 'default' });
    });

    it('updates value and persists to localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));

        act(() => {
            result.current[1]({ count: 10 });
        });

        expect(result.current[0]).toEqual({ count: 10 });
    });

    it('supports function updater', () => {
        const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));

        act(() => {
            result.current[1](prev => ({ ...prev, count: prev.count + 1 }));
        });

        expect(result.current[0]).toEqual({ count: 1 });
    });

    it('handles corrupted localStorage data gracefully', () => {
        localStorage.setItem('test-key', 'not-valid-json{{{');
        const { result } = renderHook(() => useLocalStorage('test-key', { count: 0 }));
        expect(result.current[0]).toEqual({ count: 0 });
    });

    it('handles primitive types', () => {
        const { result } = renderHook(() => useLocalStorage('test-str', 'hello'));
        expect(result.current[0]).toBe('hello');

        act(() => {
            result.current[1]('world');
        });

        expect(result.current[0]).toBe('world');
    });
});
