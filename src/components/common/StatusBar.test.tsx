import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CompilerProvider } from '@/contexts/CompilerContext';
import StatusBar from '@/components/common/StatusBar';
import React from 'react';

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <CompilerProvider>
                {children}
            </CompilerProvider>
        </SettingsProvider>
    );
}

describe('StatusBar', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('displays "Ready" in initial state', () => {
        render(<StatusBar />, { wrapper: Wrapper });
        expect(screen.getByText('Ready')).toBeInTheDocument();
    });

    it('does not have error class in initial state', () => {
        const { container } = render(<StatusBar />, { wrapper: Wrapper });
        const statusBar = container.querySelector('.status-bar');
        expect(statusBar).not.toHaveClass('error');
    });
});
