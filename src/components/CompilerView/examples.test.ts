import { describe, it, expect } from 'vitest';
import { examples, exampleCategories } from '@/components/CompilerView/examples';

describe('examples data', () => {
    it('examples object is not empty', () => {
        const keys = Object.keys(examples);
        expect(keys.length).toBeGreaterThan(0);
    });

    it('all example values are non-empty strings', () => {
        for (const [, value] of Object.entries(examples)) {
            expect(typeof value).toBe('string');
            expect(value.trim().length).toBeGreaterThan(0);
        }
    });

    it('exampleCategories is not empty', () => {
        expect(exampleCategories.length).toBeGreaterThan(0);
    });

    it('every category has a label and at least one example', () => {
        for (const category of exampleCategories) {
            expect(category.label).toBeTruthy();
            expect(category.examples.length).toBeGreaterThan(0);
        }
    });

    it('every category example key references an existing example', () => {
        for (const category of exampleCategories) {
            for (const example of category.examples) {
                expect(examples).toHaveProperty(example.key);
            }
        }
    });

    it('every category example has a non-empty label', () => {
        for (const category of exampleCategories) {
            for (const example of category.examples) {
                expect(example.label.trim().length).toBeGreaterThan(0);
            }
        }
    });

    it('no duplicate example keys across categories', () => {
        const seenKeys = new Set<string>();
        for (const category of exampleCategories) {
            for (const example of category.examples) {
                expect(seenKeys.has(example.key)).toBe(false);
                seenKeys.add(example.key);
            }
        }
    });

    it('all examples in the object are referenced by at least one category', () => {
        const referencedKeys = new Set<string>();
        for (const category of exampleCategories) {
            for (const example of category.examples) {
                referencedKeys.add(example.key);
            }
        }

        for (const key of Object.keys(examples)) {
            expect(referencedKeys.has(key)).toBe(true);
        }
    });

    it('has expected categories', () => {
        const labels = exampleCategories.map(c => c.label);
        expect(labels).toContain('Arithmetic');
        expect(labels).toContain('Control Flow');
        expect(labels).toContain('Loops');
        expect(labels).toContain('Functions & Recursion');
        expect(labels).toContain('Arrays & Strings');
        expect(labels).toContain('Advanced Algorithms');
    });
});
