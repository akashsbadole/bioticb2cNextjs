import '@testing-library/jest-dom';
import React from 'react';

// Mock next/dynamic
vi.mock('next/dynamic', () => {
    return {
        default: (fn: any) => {
            const Component = fn();
            return Component.default || Component;
        },
    };
});

// Mock WysiwygEditor globally to prevent JSDOM crashes with @mdxeditor/editor
vi.mock('@/components/admin/WysiwygEditor', () => ({
    default: ({ value, onChange, placeholder }: any) => (
        React.createElement('textarea', {
            'data-testid': 'mock-wysiwyg-editor',
            value: value || '',
            onChange: (e: any) => onChange(e.target.value),
            placeholder: placeholder,
        })
    ),
}));

vi.mock('/app/src/components/admin/WysiwygEditor', () => ({
    default: ({ value, onChange, placeholder }: any) => (
        React.createElement('textarea', {
            'data-testid': 'mock-wysiwyg-editor',
            value: value || '',
            onChange: (e: any) => onChange(e.target.value),
            placeholder: placeholder,
        })
    ),
}));

vi.mock('/app/src/components/admin/WysiwygEditor.tsx', () => ({
    default: ({ value, onChange, placeholder }: any) => (
        React.createElement('textarea', {
            'data-testid': 'mock-wysiwyg-editor',
            value: value || '',
            onChange: (e: any) => onChange(e.target.value),
            placeholder: placeholder,
        })
    ),
}));

vi.mock('../components/admin/WysiwygEditor', () => ({
    default: ({ value, onChange, placeholder }: any) => (
        React.createElement('textarea', {
            'data-testid': 'mock-wysiwyg-editor',
            value: value || '',
            onChange: (e: any) => onChange(e.target.value),
            placeholder: placeholder,
        })
    ),
}));

vi.mock('./components/admin/WysiwygEditor', () => ({
    default: ({ value, onChange, placeholder }: any) => (
        React.createElement('textarea', {
            'data-testid': 'mock-wysiwyg-editor',
            value: value || '',
            onChange: (e: any) => onChange(e.target.value),
            placeholder: placeholder,
        })
    ),
}));

// Radix UI / JSDOM Compatibility Mocks
if (typeof window !== 'undefined') {
    if (!window.PointerEvent) {
        class MockPointerEvent extends Event {
            button: number;
            ctrlKey: boolean;
            pointerType: string;
            constructor(type: string, init?: any) {
                super(type, init);
                this.button = init?.button || 0;
                this.ctrlKey = init?.ctrlKey || false;
                this.pointerType = init?.pointerType || 'mouse';
            }
        }
        window.PointerEvent = MockPointerEvent as any;
    }

    window.ResizeObserver = window.ResizeObserver || class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };

    window.HTMLElement.prototype.scrollIntoView = window.HTMLElement.prototype.scrollIntoView || function() {};
}

// Mock UI dialog directly for synchronous/inline JSDOM rendering
vi.mock('@/components/ui/dialog', () => {
    return {
        Dialog: ({ children, open }: any) => open ? children : null,
        DialogTrigger: ({ children }: any) => children,
        DialogPortal: ({ children }: any) => children,
        DialogClose: ({ children }: any) => children,
        DialogOverlay: () => null,
        DialogContent: ({ children, className, ...props }: any) => React.createElement('div', { 'data-testid': 'dialog-content', className, ...props }, children),
        DialogHeader: ({ children, className, ...props }: any) => React.createElement('div', { className, ...props }, children),
        DialogFooter: ({ children, className, ...props }: any) => React.createElement('div', { className, ...props }, children),
        DialogTitle: ({ children, className, ...props }: any) => React.createElement('h2', { className, ...props }, children),
        DialogDescription: ({ children, className, ...props }: any) => React.createElement('p', { className, ...props }, children),
    };
});

vi.mock('@/components/ui/alert-dialog', () => {
    return {
        AlertDialog: ({ children, open }: any) => open ? children : null,
        AlertDialogTrigger: ({ children }: any) => children,
        AlertDialogPortal: ({ children }: any) => children,
        AlertDialogContent: ({ children, className, ...props }: any) => React.createElement('div', { className, ...props }, children),
        AlertDialogHeader: ({ children, className, ...props }: any) => React.createElement('div', { className, ...props }, children),
        AlertDialogFooter: ({ children, className, ...props }: any) => React.createElement('div', { className, ...props }, children),
        AlertDialogTitle: ({ children, className, ...props }: any) => React.createElement('h2', { className, ...props }, children),
        AlertDialogDescription: ({ children, className, ...props }: any) => React.createElement('p', { className, ...props }, children),
        AlertDialogAction: ({ children, className, ...props }: any) => React.createElement('button', { className, ...props }, children),
        AlertDialogCancel: ({ children, className, ...props }: any) => React.createElement('button', { className, ...props }, children),
    };
});

const TabsContext = React.createContext<any>(null);

// Mock UI Tabs directly for synchronous/interactive tab-switching behavior in JSDOM
vi.mock('@/components/ui/tabs', () => {
    return {
        Tabs: ({ children, value, defaultValue, onValueChange, ...props }: any) => {
            const [localVal, setLocalVal] = React.useState(defaultValue || 'ui');
            const val = value !== undefined ? value : localVal;

            const handleValueChange = (v: string) => {
                if (value === undefined) {
                    setLocalVal(v);
                }
                if (onValueChange) onValueChange(v);
            };

            return React.createElement(
                TabsContext.Provider,
                { value: { activeValue: val, onValueChange: handleValueChange } },
                React.createElement('div', { 'data-slot': 'tabs', ...props }, children)
            );
        },
        TabsList: ({ children, ...props }: any) => {
            return React.createElement('div', { 'data-slot': 'tabs-list', ...props }, children);
        },
        TabsTrigger: ({ children, value, ...props }: any) => {
            const context = React.useContext(TabsContext);
            const isActive = context?.activeValue === value;
            return React.createElement('button', {
                type: 'button',
                'data-slot': 'tabs-trigger',
                'data-state': isActive ? 'active' : 'inactive',
                onClick: () => context?.onValueChange && context.onValueChange(value),
                ...props
            }, children);
        },
        TabsContent: ({ children, value, ...props }: any) => {
            const context = React.useContext(TabsContext);
            const isActive = context?.activeValue === value;
            return isActive ? React.createElement('div', { 'data-slot': 'tabs-content', ...props }, children) : null;
        }
    };
});
