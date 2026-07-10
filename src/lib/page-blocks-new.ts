export type BlockType =
    // Essential layout blocks
    | "hero"
    | "text"
    | "image-gallery"
    | "features"
    | "cta"
    | "testimonials"
    | "spacer"
    | "divider"

    // Product-related blocks
    | "products"
    | "product-carousel"
    | "product-categories"

    // Contact & interaction
    | "lead-capture"
    | "faq"

    // Page content blocks (fully customizable JSON)
    | "homepage-content"
    | "about-page-content"
    | "manufacturing-content"
    | "contact-page-content"
    | "catalogue-content";

export interface PageBlock {
    id: string;
    type: BlockType;
    data: Record<string, unknown>;
}

export const BLOCK_DEFAULTS: Record<
    BlockType,
    { label: string; icon: string; defaultData: Record<string, unknown> }
> = {
    // Essential layout blocks
    hero: {
        label: "Hero Banner",
        icon: "Image",
        defaultData: {
            title: "Welcome",
            subtitle: "",
            buttonText: "Learn More",
            buttonLink: "/catalogue",
            backgroundImage: "",
            height: "medium",
            alignment: "center",
        },
    },
    text: {
        label: "Text Block",
        icon: "Type",
        defaultData: {
            content: "<p>Enter your text here...</p>",
        },
    },
    "image-gallery": {
        label: "Image Gallery",
        icon: "Images",
        defaultData: {
            title: "Gallery",
            columns: 3,
            images: [""],
        },
    },
    features: {
        label: "Features Grid",
        icon: "LayoutGrid",
        defaultData: {
            title: "Our Features",
            columns: 3,
            features: [
                { title: "Feature 1", description: "Description", icon: "Star" },
            ],
        },
    },
    cta: {
        label: "Call to Action",
        icon: "MousePointerClick",
        defaultData: {
            title: "Get Started Today",
            description: "Sign up now",
            buttonText: "Sign Up",
            buttonLink: "/contact",
            backgroundColor: "emerald",
        },
    },
    testimonials: {
        label: "Testimonials",
        icon: "Quote",
        defaultData: {
            title: "What Our Clients Say",
            testimonials: [
                { name: "John Doe", role: "CEO", quote: "Great product!", avatar: "" },
            ],
        },
    },
    spacer: {
        label: "Spacer",
        icon: "MoveVertical",
        defaultData: {
            height: 64,
        },
    },
    divider: {
        label: "Divider",
        icon: "Minus",
        defaultData: {
            style: "solid",
        },
    },

    // Product-related blocks
    products: {
        label: "Product Showcase",
        icon: "Package",
        defaultData: {
            title: "Featured Products",
            maxProducts: 6,
            layout: "grid",
        },
    },
    "product-carousel": {
        label: "Product Carousel",
        icon: "Layers",
        defaultData: {
            title: "Our Products",
            maxProducts: 10,
            categoryId: "",
        },
    },
    "product-categories": {
        label: "Product Categories",
        icon: "LayoutGrid",
        defaultData: {
            title: "Browse Categories",
            description: "Explore our product range",
            categories: [],
            layout: "grid",
        },
    },

    // Contact & interaction
    "lead-capture": {
        label: "Contact Form",
        icon: "FormInput",
        defaultData: {
            title: "Get in Touch",
            description: "Send us your enquiry",
            successMessage: "Thank you for your message!",
            fields: [
                { name: "name", label: "Name", type: "text", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "message", label: "Message", type: "textarea", required: true },
            ],
        },
    },
    faq: {
        label: "FAQ Section",
        icon: "HelpCircle",
        defaultData: {
            title: "Frequently Asked Questions",
            items: [{ question: "Question?", answer: "Answer." }],
        },
    },

    // Fully customizable page content blocks (JSON-based)
    "homepage-content": {
        label: "Homepage Template",
        icon: "Home",
        defaultData: {
            hero: {
                title: "Welcome to Our Store",
                subtitle: "Discover amazing products",
                backgroundImage: "",
                buttons: []
            },
            sections: [],
            seo: {
                title: "",
                description: "",
                keywords: []
            }
        },
    },
    "about-page-content": {
        label: "About Page Template",
        icon: "FileText",
        defaultData: {
            hero: {
                title: "About Us",
                subtitle: "Our story and mission",
            },
            sections: [],
            team: [],
            company: {
                founded: "",
                location: "",
                employees: "",
                mission: ""
            }
        },
    },
    "manufacturing-content": {
        label: "Manufacturing Template",
        icon: "Factory",
        defaultData: {
            hero: {
                title: "Manufacturing Excellence",
                subtitle: "State-of-the-art facilities",
            },
            capabilities: [],
            certifications: [],
            process: [],
            facilities: {
                location: "",
                capacity: "",
                equipment: []
            }
        },
    },
    "contact-page-content": {
        label: "Contact Page Template",
        icon: "Phone",
        defaultData: {
            hero: {
                title: "Contact Us",
                subtitle: "Get in touch with our team",
            },
            locations: [],
            contactInfo: {
                phone: "",
                email: "",
                address: "",
                hours: ""
            },
            form: {
                title: "Send Message",
                fields: []
            }
        },
    },
    "catalogue-content": {
        label: "Catalogue Template",
        icon: "Grid3X3",
        defaultData: {
            hero: {
                title: "Product Catalogue",
                subtitle: "Browse our complete range",
            },
            categories: [],
            filters: [],
            display: {
                itemsPerPage: 12,
                layout: "grid",
                sortOptions: []
            }
        },
    },
};
// Utility functions for block management
export function createBlock(type: BlockType): PageBlock {
    const defaults = BLOCK_DEFAULTS[type];
    return {
        id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type,
        // Deep copy default data to avoid shared reference issues
        data: JSON.parse(JSON.stringify(defaults.defaultData)),
    };
}

export function parseJsonPayload(value: unknown, maxDepth = 4): unknown {
    let current = value;

    for (let depth = 0; depth < maxDepth; depth += 1) {
        if (typeof current !== 'string') return current;

        const trimmed = current.trim();
        if (trimmed.length === 0) return current;

        const looksLikeJson =
            (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'));

        if (!looksLikeJson) return current;

        try {
            current = JSON.parse(trimmed);
        } catch {
            return current;
        }
    }

    return current;
}

export function normalizePageBlocks(value: unknown): PageBlock[] {
    const parsed = parseJsonPayload(value);
    if (!Array.isArray(parsed)) return [];

    // Also normalize each block's data property
    return (parsed as PageBlock[]).map(block => ({
        ...block,
        data: normalizeBlockData(block.data)
    }));
}

export function normalizeBlockData(value: unknown): Record<string, unknown> {
    const parsed = parseJsonPayload(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
    }
    return {};
}