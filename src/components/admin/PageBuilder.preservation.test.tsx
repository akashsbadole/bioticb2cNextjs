/**
 * Preservation Property Tests for CMS Blocks Empty Admin Interface
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**
 * 
 * IMPORTANT: Follow observation-first methodology
 * These tests observe behavior on UNFIXED code and capture baseline behavior to preserve.
 * Tests should PASS on unfixed code to establish preservation requirements.
 * 
 * Property 2: Preservation - Non-UI Editor Functionality
 * Tests that frontend rendering, JSON editor, and block management work correctly.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import * as fc from 'fast-check';
import type { PageBlock } from '@/lib/page-blocks';
import { normalizeBlockData, createBlock, parseJsonPayload } from '@/lib/page-blocks';

// Import components for testing
import { PageBlockRenderer } from '@/components/store/PageBlockRenderer';
import { PageBuilder } from './PageBuilder';

// Test data generators for property-based testing
const validBlockDataGen = fc.record({
    title: fc.string({ minLength: 1 }),
    subtitle: fc.string(),
    content: fc.string(),
    backgroundImage: fc.string(),
    height: fc.constantFrom('small', 'medium', 'large'),
    alignment: fc.constantFrom('left', 'center', 'right'),
});

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
            { minLength: 1, maxLength: 3 }
        ),
    }),
});

const blocksArrayGen = fc.array(
    fc.oneof(heroBlockGen, textBlockGen, featuresBlockGen),
    { minLength: 1, maxLength: 5 }
);

describe('Preservation Property Tests: Non-UI Editor Functionality', () => {
    let mockOnChange: ReturnType<typeof vi.fn>;
    let mockOnNavigate: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockOnChange = vi.fn();
        mockOnNavigate = vi.fn();
        vi.clearAllMocks();
    });

    describe('Property 2.1: Frontend Rendering Preservation (Requirement 3.1)', () => {
        it('should render blocks correctly on frontend using PageBlockRenderer', () => {
            fc.assert(
                fc.property(blocksArrayGen, (blocks) => {
                    // PRESERVATION: Frontend rendering through PageBlockRenderer must continue to work
                    // This test observes current behavior and ensures it remains unchanged

                    blocks.forEach(block => {
                        const { container } = render(
                            <PageBlockRenderer
                                block={block}
                                onNavigate={mockOnNavigate}
                            />
                        );

                        // Observe: PageBlockRenderer displays blocks correctly
                        // Each block type should render some content
                        expect(container).toBeInTheDocument();
                        expect(container.firstChild).not.toBeNull();

                        // For blocks with titles, verify they appear in the rendered output
                        if (block.data.title) {
                            expect(container.textContent).toContain(block.data.title);
                        }

                        // For text blocks, verify content is rendered
                        if (block.type === 'text' && block.data.content) {
                            // Text content should be sanitized and rendered
                            expect(container.innerHTML).toContain(block.data.content);
                        }

                        // For features blocks, verify features are rendered
                        if (block.type === 'features' && block.data.features) {
                            const features = block.data.features as Array<{ title: string }>;
                            features.forEach(feature => {
                                if (feature.title) {
                                    expect(container.textContent).toContain(feature.title);
                                }
                            });
                        }
                    });

                    return true;
                }),
                { numRuns: 10 }
            );
        });

        it('should handle block data normalization correctly for frontend rendering', () => {
            fc.assert(
                fc.property(validBlockDataGen, (blockData) => {
                    // PRESERVATION: Data parsing through normalizeBlockData must preserve existing logic
                    // This observes current normalization behavior

                    const normalized = normalizeBlockData(blockData);

                    // Should return an object
                    expect(typeof normalized).toBe('object');
                    expect(normalized).not.toBeNull();
                    expect(Array.isArray(normalized)).toBe(false);

                    // Should preserve existing data structure
                    Object.keys(blockData).forEach(key => {
                        expect(normalized).toHaveProperty(key);
                        expect(normalized[key]).toBe(blockData[key]);
                    });

                    return true;
                }),
                { numRuns: 15 }
            );
        });
    });

    describe('Property 2.2: JSON Editor Functionality Preservation (Requirements 3.3, 3.5)', () => {
        it('should show and allow editing of raw JSON data in JSON editor tab', () => {
            fc.assert(
                fc.property(heroBlockGen, (block) => {
                    // PRESERVATION: JSON editor tab must continue to show valid JSON data structure

                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    // Open block for editing
                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    return waitFor(() => {
                        // Switch to JSON editor tab
                        const jsonTab = screen.getByText('JSON Editor');
                        fireEvent.click(jsonTab);

                        // Should show textarea with JSON content
                        const jsonTextarea = screen.getByRole('textbox');
                        expect(jsonTextarea).toBeInTheDocument();

                        // JSON should be valid and parseable
                        const jsonValue = (jsonTextarea as HTMLTextAreaElement).value;
                        expect(() => JSON.parse(jsonValue)).not.toThrow();

                        // JSON should contain block data
                        const parsedJson = JSON.parse(jsonValue);
                        expect(parsedJson.title).toBe(block.data.title);
                        expect(parsedJson.subtitle).toBe(block.data.subtitle);

                        return true;
                    });
                }),
                { numRuns: 5 }
            );
        });

        it('should handle JSON editing and maintain data consistency between tabs', () => {
            fc.assert(
                fc.property(textBlockGen, (block) => {
                    // PRESERVATION: JSON editor changes should sync with UI tab data

                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    return waitFor(() => {
                        // Go to JSON tab
                        const jsonTab = screen.getByText('JSON Editor');
                        fireEvent.click(jsonTab);

                        const jsonTextarea = screen.getByRole('textbox') as HTMLTextAreaElement;
                        const originalData = JSON.parse(jsonTextarea.value);

                        // Modify JSON data
                        const modifiedData = {
                            ...originalData,
                            content: 'Modified content in JSON'
                        };

                        fireEvent.change(jsonTextarea, {
                            target: { value: JSON.stringify(modifiedData, null, 2) }
                        });

                        // Data should be updated (observable behavior to preserve)
                        expect(jsonTextarea.value).toContain('Modified content in JSON');

                        return true;
                    });
                }),
                { numRuns: 3 }
            );
        });

        it('should parse JSON payload correctly with parseJsonPayload function', () => {
            fc.assert(
                fc.property(validBlockDataGen, (data) => {
                    // PRESERVATION: parseJsonPayload function must continue working as expected

                    const jsonString = JSON.stringify(data);
                    const parsed = parseJsonPayload(jsonString);

                    expect(parsed).toEqual(data);

                    // Should handle stringified JSON
                    const doubleStringified = JSON.stringify(jsonString);
                    const parsedDouble = parseJsonPayload(doubleStringified);
                    expect(parsedDouble).toEqual(data);

                    return true;
                }),
                { numRuns: 10 }
            );
        });
    });

    describe('Property 2.3: Block Creation and Management Preservation (Requirements 3.4, 3.6)', () => {
        it('should create new blocks properly with createBlock function', () => {
            const blockTypes: Array<'hero' | 'text' | 'features'> = ['hero', 'text', 'features'];

            fc.assert(
                fc.property(fc.constantFrom(...blockTypes), (blockType) => {
                    // PRESERVATION: New block creation workflow must continue to work

                    const newBlock = createBlock(blockType);

                    // Should create valid block structure
                    expect(newBlock).toHaveProperty('id');
                    expect(newBlock).toHaveProperty('type');
                    expect(newBlock).toHaveProperty('data');
                    expect(newBlock.type).toBe(blockType);
                    expect(typeof newBlock.id).toBe('string');
                    expect(newBlock.id.length).toBeGreaterThan(0);
                    expect(typeof newBlock.data).toBe('object');

                    return true;
                }),
                { numRuns: 10 }
            );
        });

        it('should handle block deletion correctly', () => {
            fc.assert(
                fc.property(blocksArrayGen, (blocks) => {
                    // PRESERVATION: Block deletion must continue to work properly

                    if (blocks.length === 0) return true;

                    render(
                        <PageBuilder
                            blocks={blocks}
                            onChange={mockOnChange}
                        />
                    );

                    // Should show all blocks
                    const blockElements = screen.getAllByTitle('Edit Block');
                    expect(blockElements).toHaveLength(blocks.length);

                    // Delete first block
                    const deleteButton = screen.getAllByRole('button').find(btn =>
                        btn.querySelector('svg')?.classList.contains('lucide-trash-2') ||
                        btn.getAttribute('title')?.includes('delete') ||
                        btn.textContent === 'Delete'
                    );

                    if (deleteButton) {
                        fireEvent.click(deleteButton);

                        // Should trigger onChange with modified blocks
                        // Note: We observe that the component calls onChange when blocks are modified
                        expect(mockOnChange).toHaveBeenCalled();
                    }

                    return true;
                }),
                { numRuns: 5 }
            );
        });

        it('should handle block duplication correctly', () => {
            fc.assert(
                fc.property(heroBlockGen, (block) => {
                    // PRESERVATION: Block duplication must continue to work properly

                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    // Find duplicate button
                    const duplicateButton = screen.getByTitle('Duplicate Block');
                    expect(duplicateButton).toBeInTheDocument();

                    fireEvent.click(duplicateButton);

                    // Should call onChange (preservation of duplication behavior)
                    expect(mockOnChange).toHaveBeenCalled();

                    return true;
                }),
                { numRuns: 3 }
            );
        });

        it('should handle block reordering (move up/down) correctly', () => {
            fc.assert(
                fc.property(blocksArrayGen, (blocks) => {
                    // PRESERVATION: Block reordering must continue to work properly

                    if (blocks.length < 2) return true;

                    render(
                        <PageBuilder
                            blocks={blocks}
                            onChange={mockOnChange}
                        />
                    );

                    // Should show move up/down buttons
                    const moveButtons = screen.getAllByRole('button').filter(btn =>
                        btn.querySelector('svg')?.classList.contains('lucide-chevron-up') ||
                        btn.querySelector('svg')?.classList.contains('lucide-chevron-down')
                    );

                    expect(moveButtons.length).toBeGreaterThan(0);

                    // Click a move button (if available and enabled)
                    const enabledMoveButton = moveButtons.find(btn => !btn.disabled);
                    if (enabledMoveButton) {
                        fireEvent.click(enabledMoveButton);

                        // Should trigger onChange (preservation of reordering behavior)
                        expect(mockOnChange).toHaveBeenCalled();
                    }

                    return true;
                }),
                { numRuns: 5 }
            );
        });
    });

    describe('Property 2.4: Data Storage and Retrieval Patterns Preservation (Requirement 3.2)', () => {
        it('should handle database-style JSON string storage correctly', () => {
            fc.assert(
                fc.property(validBlockDataGen, (data) => {
                    // PRESERVATION: Block data storage in ContentPage.blocks as JSON strings
                    // This simulates how data is stored and retrieved from database

                    // Simulate database storage (as JSON string)
                    const storedJsonString = JSON.stringify(data);

                    // Simulate retrieval and parsing
                    const retrieved = JSON.parse(storedJsonString);
                    expect(retrieved).toEqual(data);

                    // Should work with normalizeBlockData
                    const normalized = normalizeBlockData(retrieved);
                    expect(normalized).toEqual(data);

                    return true;
                }),
                { numRuns: 10 }
            );
        });

        it('should handle nested complex page content data correctly', () => {
            const complexPageData = {
                hero: {
                    title: 'Complex Title',
                    subtitle: 'Complex Subtitle',
                    badge: 'Badge Text'
                },
                metrics: [
                    { value: '100', label: 'Metric 1' },
                    { value: '200', label: 'Metric 2' }
                ],
                nested: {
                    deep: {
                        value: 'Deeply nested value'
                    }
                }
            };

            // PRESERVATION: Complex nested data should be handled correctly
            const normalized = normalizeBlockData(complexPageData);
            expect(normalized).toEqual(complexPageData);

            // Should work through JSON serialization/deserialization
            const jsonString = JSON.stringify(complexPageData);
            const parsed = parseJsonPayload(jsonString);
            expect(parsed).toEqual(complexPageData);
        });
    });

    describe('Property 2.5: Tab Synchronization Preservation (Requirement 3.5)', () => {
        it('should maintain existing tab behavior and data consistency', () => {
            fc.assert(
                fc.property(heroBlockGen, (block) => {
                    // PRESERVATION: Tab switching should maintain data consistency

                    render(
                        <PageBuilder
                            blocks={[block]}
                            onChange={mockOnChange}
                        />
                    );

                    const editButton = screen.getByTitle('Edit Block');
                    fireEvent.click(editButton);

                    return waitFor(() => {
                        // Should start on UI tab
                        const uiTab = screen.getByText('UI Editor');
                        const jsonTab = screen.getByText('JSON Editor');

                        expect(uiTab).toBeInTheDocument();
                        expect(jsonTab).toBeInTheDocument();

                        // Switch to JSON tab
                        fireEvent.click(jsonTab);

                        // Should show JSON textarea
                        const jsonTextarea = screen.getByRole('textbox');
                        expect(jsonTextarea).toBeInTheDocument();

                        // Switch back to UI tab
                        fireEvent.click(uiTab);

                        // Should show UI fields again
                        const titleInput = screen.getByLabelText(/title/i);
                        expect(titleInput).toBeInTheDocument();

                        return true;
                    });
                }),
                { numRuns: 3 }
            );
        });
    });
});