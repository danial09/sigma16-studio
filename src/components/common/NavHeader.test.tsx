import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NavHeader from '@/components/common/NavHeader';

describe('NavHeader', () => {
    it('renders the title', () => {
        render(
            <MemoryRouter>
                <NavHeader title="Test Page" />
            </MemoryRouter>,
        );
        expect(screen.getByText('Test Page')).toBeInTheDocument();
    });

    it('renders back link pointing to home by default', () => {
        render(
            <MemoryRouter>
                <NavHeader title="Settings" />
            </MemoryRouter>,
        );
        const link = screen.getByText('← Back to Compiler');
        expect(link).toBeInTheDocument();
        expect(link.closest('a')).toHaveAttribute('href', '/');
    });

    it('renders back link with custom backTo path', () => {
        render(
            <MemoryRouter>
                <NavHeader title="Sub Page" backTo="/settings" />
            </MemoryRouter>,
        );
        const link = screen.getByText('← Back to Compiler');
        expect(link.closest('a')).toHaveAttribute('href', '/settings');
    });
});
