import '@testing-library/jest-dom';

// Mock next/dynamic
vi.mock('next/dynamic', () => {
    return {
        default: (fn: any) => {
            const Component = fn();
            return Component.default || Component;
        },
    };
});