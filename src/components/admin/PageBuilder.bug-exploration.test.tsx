/**
 * Bug Condition Exploration Test for CMS Blocks Empty Admin Interface
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * This test validates that the UI editor dialog is fully functional and populated.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import * as fc from 'fast-check';
import type { PageBlock } from '@/lib/page-blocks';
import { normalizeBlockData } from '@/lib/page-blocks';

// Import PageBuilder
import { PageBuilder } from './PageBuilder';

// Test data generators for property-based testing
const safeString = (opts?: { minLength?: number }) =>
    fc.string(opts).map(str => {
        const clean = str.replace(/[^a-zA-Z0-9]/g, '');
        return clean.trim().length === 0 ? 'safevalue' : clean;
    });

const heroBlockGen = fc.record({
    id: safeString({ minLength: 1 }),
    type: fc.constant('hero' as const),
    data: fc.record({
        title: safeString({ minLength: 1 }),
        subtitle: safeString({ minLength: 1 }),
        buttonText: safeString({ minLength: 1 }),
        buttonLink: safeString({ minLength: 1 }),
        backgroundImage: safeString(),
        height: fc.constantFrom('small', 'medium', 'large'),
        alignment: fc.constantFrom('left', 'center', 'right'),
    }),
});

const textBlockGen = fc.record({
    id: safeString({ minLength: 1 }),
    type: fc.constant('text' as const),
    data: fc.record({
        content: safeString({ minLength: 1 }),
    }),
});

const featuresBlockGen = fc.record({
    id: safeString({ minLength: 1 }),
    type: fc.constant('features' as const),
    data: fc.record({
        title: safeString({ minLength: 1 }),
        columns: fc.integer({ min: 2, max: 4 }),
        features: fc.array(
            fc.record({
                title: safeString({ minLength: 1 }),
                description: safeString({ minLength: 1 }),
                icon: safeString({ minLength: 1 }),
            }),
            { minLength: 1, maxLength: 5 }
        ),
    }),
});

const mfgPageContentBlockGen = fc.record({
    id: safeString({ minLength: 1 }),
    type: fc.constant('mfg-page-content' as const),
    data: fc.record({
        hero: fc.record({
            title: safeString({ minLength: 1 }),
            subtitle: safeString({ minLength: 1 }),
            badge: safeString({ minLength: 1 }),
        }),
        metrics: fc.array(
            fc.record({
                value: safeString({ minLength: 1 }),
                label: safeString({ minLength: 1 }),
            }),
            { minLength: 1, maxLength: 4 }
        ),
        intro: fc.record({
            heading: safeString({ minLength: 1 }),
            description: safeString({ minLength: 1 }),
        }),
    }),
});

const aboutPageContentBlockGen = fc.record({
    id: safeString({ minLength: 1 }),
    type: fc.constant('about-page-content' as const),
    data: fc.record({
        hero: fc.record({
            title: safeString({ minLength: 1 }),
            subtitle: safeString({ minLength: 1 }),
            estYear: safeString({ minLength: 1 }),
        }),
        stats: fc.array(
            fc.record({
                value: safeString({ minLength: 1 }),
                label: safeString({ minLength: 1 }),
            }),
            { minLength: 1, maxLength: 4 }
        ),
        story: fc.record({
            heading: safeString({ minLength: 1 }),
            subtitle: safeString({ minLength: 1 }),
        }),
    }),
});

describe('Bug Condition Exploration: CMS Block Data Display in Admin UI', () => {
    let mockOnChange: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnChange = vi.fn();
        vi.clearAllMocks();
    });

    describe('Property 1: Bug Condition - Regular Block Fields Should Display Actual Content', () => {
        it('should display hero block title and subtitle in UI editor fields when block has populated data', async () => {
            await fc.assert(
                fc.asyncProperty(heroBlockGen, async (block) => {
                    cleanup();
                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    // Open the block for editing
                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    // Wait for dialog to open and verify fields show the correct values
                    await waitFor(() => {
                        const titleInput = screen.getByDisplayValue(block.data.title) as HTMLInputElement;
                        const subtitleInput = screen.getByDisplayValue(block.data.subtitle) as HTMLInputElement;
                        expect(titleInput).toBeInTheDocument();
                        expect(subtitleInput).toBeInTheDocument();
                    });

                    cleanup();
                    return true;
                }),
                { numRuns: 1, timeout: 30000 }
            );
        }, 30000);

        it('should display text block content in UI editor textarea when block has populated data', async () => {
            await fc.assert(
                fc.asyncProperty(textBlockGen, async (block) => {
                    cleanup();
                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    // Open the block for editing
                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    // Wait for dialog to open
                    await waitFor(() => {
                        const contentTextarea = screen.getByTestId('mock-wysiwyg-editor') as HTMLTextAreaElement;
                        expect(contentTextarea.value).toBe(block.data.content);
                    });

                    cleanup();
                    return true;
                }),
                { numRuns: 1, timeout: 30000 }
            );
        }, 30000);

        it('should display features block data including feature count and populated fields', async () => {
            await fc.assert(
                fc.asyncProperty(featuresBlockGen, async (block) => {
                    cleanup();
                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    await waitFor(() => {
                        const titleInput = screen.getByDisplayValue(block.data.title) as HTMLInputElement;
                        expect(titleInput).toBeInTheDocument();

                        // Check that existing features are displayed (not empty)
                        const featureCards = screen.getAllByText(/Feature \d+/);
                        expect(featureCards).toHaveLength(block.data.features.length);

                        // Verify first feature has its actual data displayed
                        if (block.data.features.length > 0) {
                            const firstFeatureTitleInput = screen.getAllByPlaceholderText('Title')[0] as HTMLInputElement;
                            expect(firstFeatureTitleInput.value).toBe(block.data.features[0].title);
                        }
                    });

                    cleanup();
                    return true;
                }),
                { numRuns: 2 }
            );
        }, 30000);
    });

    describe('Property 1: Bug Condition - Page Content Blocks Should Show Field Summaries', () => {
        it('should display meaningful field summary for mfg-page-content instead of generic message', async () => {
            await fc.assert(
                fc.asyncProperty(mfgPageContentBlockGen, async (block) => {
                    cleanup();
                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    await waitFor(() => {
                        const warningDiv = screen.getByText(/This block stores nested CMS fields/);
                        const fieldSummary = warningDiv.textContent;

                        // Should mention actual top-level field names, not just generic text
                        expect(fieldSummary).toMatch(/hero|metrics|intro/);

                        // Should NOT be just the generic "Full page payload" text
                        expect(fieldSummary).not.toBe('This block stores nested CMS fields. Use the JSON Editor tab to update fields.');
                    });

                    cleanup();
                    return true;
                }),
                { numRuns: 1, timeout: 30000 }
            );
        }, 30000);

        it('should display actual field names for about-page-content block', async () => {
            await fc.assert(
                fc.asyncProperty(aboutPageContentBlockGen, async (block) => {
                    cleanup();
                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    await waitFor(() => {
                        // Should show field summary with actual field names
                        const fieldInfo = screen.getByText(/Use the JSON Editor tab/);
                        const summaryText = fieldInfo.textContent;

                        // Should reference actual top-level keys from the block data
                        expect(summaryText).toMatch(/hero|stats|story/);
                    });

                    cleanup();
                    return true;
                }),
                { numRuns: 1, timeout: 30000 }
            );
        }, 30000);
    });

    describe('Bug Condition Analysis', () => {
        it('demonstrates the root cause: normalizeBlockData vs UI field population mismatch', async () => {
            cleanup();
            const testBlock: PageBlock = {
                id: 'test-hero-1',
                type: 'hero',
                data: {
                    title: 'Test Hero Title',
                    subtitle: 'Test Hero Subtitle',
                    buttonText: 'Click Me',
                    buttonLink: '/test',
                },
            };

            // Test that normalization works correctly
            const normalizedData = normalizeBlockData(testBlock.data);
            expect(normalizedData.title).toBe('Test Hero Title');
            expect(normalizedData.subtitle).toBe('Test Hero Subtitle');

            render(
                <PageBuilder
                    blocks={[testBlock]}
                    onChange={mockOnChange}
                />
            );

            const editButton = screen.getByTitle('Edit Block');
            fireEvent.click(editButton);

            await waitFor(() => {
                const titleInput = screen.getByDisplayValue('Test Hero Title') as HTMLInputElement;
                const subtitleInput = screen.getByDisplayValue('Test Hero Subtitle') as HTMLInputElement;
                expect(titleInput).toBeInTheDocument();
                expect(subtitleInput).toBeInTheDocument();
            });
            cleanup();
        });
    });
});
