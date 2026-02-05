import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { CompilerProvider } from '@/contexts/CompilerContext';
import Header from '@/components/CompilerView/Header';
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

describe('Header', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('renders app title', () => {
        render(<Header />, { wrapper: Wrapper });
        expect(screen.getByText('Sigma16 Studio')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(<Header />, { wrapper: Wrapper });
        expect(screen.getByText('About')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('navigation links point to correct routes', () => {
        render(<Header />, { wrapper: Wrapper });
        expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/about');
        expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/settings');
    });

    it('renders StatusBar', () => {
        render(<Header />, { wrapper: Wrapper });
        expect(screen.getByText('Ready')).toBeInTheDocument();
    });
});
