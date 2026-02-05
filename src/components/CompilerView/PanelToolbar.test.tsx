import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CompilerProvider } from '@/contexts/CompilerContext';
import PanelToolbar from '@/components/CompilerView/PanelToolbar';
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

describe('PanelToolbar', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders compile button', () => {
        render(<PanelToolbar />, { wrapper: Wrapper });
        expect(screen.getByText('Compile')).toBeInTheDocument();
    });

    it('compile button is enabled by default', () => {
        render(<PanelToolbar />, { wrapper: Wrapper });
        const button = screen.getByText('Compile');
        expect(button).not.toBeDisabled();
    });

    it('renders examples menu trigger', () => {
        render(<PanelToolbar />, { wrapper: Wrapper });
        expect(screen.getByText('Load example... ▾')).toBeInTheDocument();
    });

    it('renders examples label', () => {
        render(<PanelToolbar />, { wrapper: Wrapper });
        expect(screen.getByText('Examples:')).toBeInTheDocument();
    });

    it('opens dropdown on click', async () => {
        const user = userEvent.setup();
        render(<PanelToolbar />, { wrapper: Wrapper });

        const trigger = screen.getByText('Load example... ▾');
        await user.click(trigger);

        // Categories should appear
        expect(screen.getByText('Arithmetic')).toBeInTheDocument();
        expect(screen.getByText('Control Flow')).toBeInTheDocument();
        expect(screen.getByText('Loops')).toBeInTheDocument();
    });

    it('closes dropdown on second click', async () => {
        const user = userEvent.setup();
        render(<PanelToolbar />, { wrapper: Wrapper });

        const trigger = screen.getByText('Load example... ▾');
        await user.click(trigger);
        expect(screen.getByText('Arithmetic')).toBeInTheDocument();

        await user.click(trigger);
        expect(screen.queryByText('Arithmetic')).not.toBeInTheDocument();
    });
});
