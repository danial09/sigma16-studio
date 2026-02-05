import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePanelMount } from '@/hooks/usePanelMount';

describe('usePanelMount', () => {
    beforeEach(() => {
        // Clean up any test elements
        document.getElementById('test-mount')?.remove();
    });

    it('returns true immediately if element already exists', () => {
        const el = document.createElement('div');
        el.id = 'test-mount';
        document.body.appendChild(el);

        const { result } = renderHook(() => usePanelMount('test-mount'));
        expect(result.current).toBe(true);
    });

    it('returns false initially if element does not exist', () => {
        const { result } = renderHook(() => usePanelMount('nonexistent-mount'));
        expect(result.current).toBe(false);
    });

    it('transitions to true when element appears in DOM', async () => {
        const { result } = renderHook(() => usePanelMount('test-mount'));
        expect(result.current).toBe(false);

        // Simulate element being added to DOM
        const el = document.createElement('div');
        el.id = 'test-mount';
        document.body.appendChild(el);

        // MutationObserver fires asynchronously
        await vi.waitFor(() => {
            expect(result.current).toBe(true);
        });
    });
});
