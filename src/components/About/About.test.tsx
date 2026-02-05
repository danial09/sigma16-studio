import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CompilerProvider } from '@/contexts/CompilerContext';
import About from '@/components/About/About';
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

describe('About', () => {
    it('renders the page title', () => {
        render(<About />, { wrapper: Wrapper });
        expect(screen.getByRole('heading', { level: 1, name: 'About' })).toBeInTheDocument();
    });

    it('renders the project name', () => {
        render(<About />, { wrapper: Wrapper });
        expect(screen.getByText('Sigma16 Studio')).toBeInTheDocument();
    });

    it('renders the version number', () => {
        render(<About />, { wrapper: Wrapper });
        expect(screen.getByText(/Version: 0\.1\.0/)).toBeInTheDocument();
    });

    it('renders a back link', () => {
        render(<About />, { wrapper: Wrapper });
        expect(screen.getByText('← Back to Compiler')).toBeInTheDocument();
    });

    it('renders Resources section', () => {
        render(<About />, { wrapper: Wrapper });
        expect(screen.getByText('Resources')).toBeInTheDocument();
    });
});
