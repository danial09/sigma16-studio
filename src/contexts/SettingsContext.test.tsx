import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SettingsProvider, useSettings } from '@/contexts/SettingsContext';
import React from 'react';

function wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(SettingsProvider, null, children);
}

describe('SettingsContext', () => {
    beforeEach(() => {
        localStorage.clear();
        document.body.className = '';
    });

    it('provides default settings', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('dark');
        expect(result.current.settings.fontSize).toBe(14);
    });

    it('updates theme', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => {
            result.current.updateSettings({ theme: 'light' });
        });

        expect(result.current.settings.theme).toBe('light');
    });

    it('updates fontSize', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => {
            result.current.updateSettings({ fontSize: 18 });
        });

        expect(result.current.settings.fontSize).toBe(18);
    });

    it('applies theme class to document body', () => {
        const { result } = renderHook(() => useSettings(), { wrapper });

        act(() => {
            result.current.updateSettings({ theme: 'light' });
        });

        expect(document.body.classList.contains('theme-light')).toBe(true);
        expect(document.body.classList.contains('theme-dark')).toBe(false);
    });

    it('loads persisted settings from localStorage', () => {
        localStorage.setItem('sigma16_settings', JSON.stringify({ theme: 'light', fontSize: 20 }));

        const { result } = renderHook(() => useSettings(), { wrapper });
        expect(result.current.settings.theme).toBe('light');
        expect(result.current.settings.fontSize).toBe(20);
    });

    it('throws when used outside provider', () => {
        expect(() => {
            renderHook(() => useSettings());
        }).toThrow('useSettings must be used within SettingsProvider');
    });
});
