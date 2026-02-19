import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CompilerProvider } from '@/contexts/CompilerContext';
import Settings from '@/components/Settings/Settings';
import React from 'react';

function Wrapper({ children }: { children: React.ReactNode }) {
    return (
        <MemoryRouter>
            <SettingsProvider>
                <CompilerProvider>
                    {children}
                </CompilerProvider>
            </SettingsProvider>
        </MemoryRouter>
    );
}

describe('Settings', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders Editor Settings section', () => {
        render(<Settings />, { wrapper: Wrapper });
        expect(screen.getByText('Editor Settings')).toBeInTheDocument();
    });

    it('renders Compiler Settings section', () => {
        render(<Settings />, { wrapper: Wrapper });
        expect(screen.getByText('Compiler Settings')).toBeInTheDocument();
    });

    it('renders theme selector with dark as default', () => {
        render(<Settings />, { wrapper: Wrapper });
        const themeSelect = screen.getByLabelText('Theme:') as HTMLSelectElement;
        expect(themeSelect.value).toBe('dark');
    });

    it('renders font size input with 14 as default', () => {
        render(<Settings />, { wrapper: Wrapper });
        const fontSizeInput = screen.getByLabelText('Font Size:') as HTMLInputElement;
        expect(fontSizeInput.value).toBe('14');
    });

    it('renders emit ASM checkbox (checked by default)', () => {
        render(<Settings />, { wrapper: Wrapper });
        const emitAsmCheckbox = screen.getByLabelText('Emit ASM:') as HTMLInputElement;
        expect(emitAsmCheckbox.checked).toBe(true);
    });

    it('changes theme when selecting light', async () => {
        const user = userEvent.setup();
        render(<Settings />, { wrapper: Wrapper });
        const themeSelect = screen.getByLabelText('Theme:');

        await user.selectOptions(themeSelect, 'light');

        expect((themeSelect as HTMLSelectElement).value).toBe('light');
    });

    it('renders back link to compiler', () => {
        render(<Settings />, { wrapper: Wrapper });
        expect(screen.getByText('← Back to Compiler')).toBeInTheDocument();
    });
});
