/**
 * Bug Condition Exploration Test for CMS Blocks Empty Admin Interface
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3**
 * 
 * This test MUST FAIL on unfixed code - failure confirms the bug exists.
 * DO NOT attempt to fix the test or code when it fails.
 * The test encodes the expected behavior - it will validate the fix when it passes.
 * 
 * GOAL: Surface counterexamples that demonstrate existing CMS blocks appear empty in admin UI
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import type { PageBlock } from '@/lib/page-blocks';
import { normalizeBlockData } from '@/lib/page-blocks';

// Mock the PageBuilder component - we need to import and test the BlockEditDialog specifically
import { PageBuilder } from './PageBuilder';

// Test data generators for property-based testing
const heroBlockGen = fc.record({
    id: fc.string({ minLength: 1 }),
    type: fc.constant('hero' as const),
    data: fc.record({
        title: fc.string({ minLength: 1 }),
        subtitle: fc.string({ minLength: 1 }),
        buttonText: fc.string({ minLength: 1 }),
        buttonLink: fc.string({ minLength: 1 }),
        backgroundImage: fc.string(),
        height: fc.constantFrom('small', 'medium', 'large'),
        alignment: fc.constantFrom('left', 'center', 'right'),
    }),
});

const textBlockGen = fc.record({
    id: fc.string({ minLength: 1 }),
    type: fc.constant('text' as const),
    data: fc.record({
        content: fc.string({ minLength: 1 }),
    }),
});

const featuresBlockGen = fc.record({
    id: fc.string({ minLength: 1 }),
    type: fc.constant('features' as const),
    data: fc.record({
        title: fc.string({ minLength: 1 }),
        columns: fc.integer({ min: 2, max: 4 }),
        features: fc.array(
            fc.record({
                title: fc.string({ minLength: 1 }),
                description: fc.string({ minLength: 1 }),
                icon: fc.string({ minLength: 1 }),
            }),
            { minLength: 1, maxLength: 5 }
        ),
    }),
});

const mfgPageContentBlockGen = fc.record({
    id: fc.string({ minLength: 1 }),
    type: fc.constant('mfg-page-content' as const),
    data: fc.record({
        hero: fc.record({
            title: fc.string({ minLength: 1 }),
            subtitle: fc.string({ minLength: 1 }),
            badge: fc.string({ minLength: 1 }),
        }),
        metrics: fc.array(
            fc.record({
                value: fc.string({ minLength: 1 }),
                label: fc.string({ minLength: 1 }),
            }),
            { minLength: 1, maxLength: 4 }
        ),
        intro: fc.record({
            heading: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
        }),
    }),
});

const aboutPageContentBlockGen = fc.record({
    id: fc.string({ minLength: 1 }),
    type: fc.constant('about-page-content' as const),
    data: fc.record({
        hero: fc.record({
            title: fc.string({ minLength: 1 }),
            subtitle: fc.string({ minLength: 1 }),
            estYear: fc.string({ minLength: 1 }),
        }),
        stats: fc.array(
            fc.record({
                value: fc.string({ minLength: 1 }),
                label: fc.string({ minLength: 1 }),
            }),
            { minLength: 1, maxLength: 4 }
        ),
        story: fc.record({
            heading: fc.string({ minLength: 1 }),
            subtitle: fc.string({ minLength: 1 }),
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
        it('should display hero block title and subtitle in UI editor fields when block has populated data', () => {
            fc.assert(
                fc.property(heroBlockGen, (block) => {
                    // EXPECTED BEHAVIOR: When a hero block with populated data is opened in UI editor,
                    // the title and subtitle fields should display the actual stored values

                    const { rerender } = render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    // Open the block for editing
                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    // Wait for dialog to open
                    return waitFor(() => {
                        // Check if the UI editor tab is active and fields are populated with actual data
                        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
                        const subtitleInput = screen.getByLabelText(/subtitle/i) as HTMLInputElement;

                        // BUG CONDITION: These assertions will FAIL on unfixed code
                        // The bug is that these fields appear empty despite having valid data in block.data
                        expect(titleInput.value).toBe(block.data.title);
                        expect(subtitleInput.value).toBe(block.data.subtitle);

                        // If we reach here, the UI editor is displaying actual content (bug is fixed)
                        return true;
                    });
                }),
                { numRuns: 10 }
            );
        });

        it('should display text block content in UI editor textarea when block has populated data', () => {
            fc.assert(
                fc.property(textBlockGen, (block) => {
                    // EXPECTED BEHAVIOR: When a text block with populated content is opened in UI editor,
                    // the textarea should display the actual stored HTML content

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
                    return waitFor(() => {
                        const contentTextarea = screen.getByLabelText(/HTML Content/i) as HTMLTextAreaElement;

                        // BUG CONDITION: This assertion will FAIL on unfixed code
                        // The bug is that this textarea appears empty despite having valid content
                        expect(contentTextarea.value).toBe(block.data.content);

                        return true;
                    });
                }),
                { numRuns: 5 }
            );
        });

        it('should display features block data including feature count and populated fields', () => {
            fc.assert(
                fc.property(featuresBlockGen, (block) => {
                    // EXPECTED BEHAVIOR: When a features block with populated data is opened in UI editor,
                    // should show title, column count, and existing features with their data

                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    return waitFor(() => {
                        const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
                        const columnsSelect = screen.getByLabelText(/columns/i) as HTMLSelectElement;

                        // BUG CONDITION: These will FAIL on unfixed code
                        expect(titleInput.value).toBe(block.data.title);
                        expect(Number(columnsSelect.value)).toBe(block.data.columns);

                        // Check that existing features are displayed (not empty)
                        const featureCards = screen.getAllByText(/Feature \d+/);
                        expect(featureCards).toHaveLength(block.data.features.length);

                        // Verify first feature has its actual data displayed
                        if (block.data.features.length > 0) {
                            const firstFeatureTitleInput = screen.getAllByPlaceholderText('Title')[0] as HTMLInputElement;
                            expect(firstFeatureTitleInput.value).toBe(block.data.features[0].title);
                        }

                        return true;
                    });
                }),
                { numRuns: 5 }
            );
        });
    });

    describe('Property 1: Bug Condition - Page Content Blocks Should Show Field Summaries', () => {
        it('should display meaningful field summary for mfg-page-content instead of generic message', () => {
            fc.assert(
                fc.property(mfgPageContentBlockGen, (block) => {
                    // EXPECTED BEHAVIOR: Page content blocks should show summaries of their nested data,
                    // not just generic "Full page payload" message

                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    return waitFor(() => {
                        // BUG CONDITION: On unfixed code, this will show generic message
                        // Expected: Should show field names like "hero, metrics, intro" or field count
                        const warningDiv = screen.getByText(/This block stores nested CMS fields/);
                        const fieldSummary = warningDiv.textContent;

                        // Should mention actual top-level field names, not just generic text
                        expect(fieldSummary).toMatch(/hero|metrics|intro/);

                        // Should NOT be just the generic "Full page payload" text
                        expect(fieldSummary).not.toBe('This block stores nested CMS fields. Use the JSON Editor tab to update fields.');

                        return true;
                    });
                }),
                { numRuns: 5 }
            );
        });

        it('should display actual field names for about-page-content block', () => {
            fc.assert(
                fc.property(aboutPageContentBlockGen, (block) => {
                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    return waitFor(() => {
                        // BUG CONDITION: Should show field summary with actual field names
                        const fieldInfo = screen.getByText(/Use the JSON Editor tab/);
                        const summaryText = fieldInfo.textContent;

                        // Should reference actual top-level keys from the block data
                        expect(summaryText).toMatch(/hero|stats|story/);

                        return true;
                    });
                }),
                { numRuns: 3 }
            );
        });
    });

    describe('Bug Condition Analysis', () => {
        it('demonstrates the root cause: normalizeBlockData vs UI field population mismatch', () => {
            // Create a block with data that should be visible but may not be due to the bug
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

            // Test that normalization works correctly (this should pass)
            const normalizedData = normalizeBlockData(testBlock.data);
            expect(normalizedData.title).toBe('Test Hero Title');
            expect(normalizedData.subtitle).toBe('Test Hero Subtitle');

            // The bug is in the UI layer - data exists and parses correctly,
            // but BlockEditDialog may not populate form fields with this data
            render(
                <PageBuilder
                    blocks={[testBlock]}
                    onChange={mockOnChange}
                />
            );

            const editButton = screen.getByTitle('Edit Block');
            fireEvent.click(editButton);

            // BUG CONDITION: UI fields should show the actual data
            return waitFor(() => {
                const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
                const subtitleInput = screen.getByLabelText(/subtitle/i) as HTMLInputElement;

                // These will FAIL on unfixed code, confirming the bug exists
                expect(titleInput.value).toBe(testBlock.data.title);
                expect(subtitleInput.value).toBe(testBlock.data.subtitle);

                return true;
            });
        });
    });
});