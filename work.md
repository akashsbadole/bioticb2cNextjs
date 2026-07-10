this is wireframe, header, footer, Hero banner, S2 · Trust numbers bar — animated counters, S3 · Who we serve — audience cards, S4 · Manufacturing capabilities snapshot, S5 · Product category preview, S6 · Factory & facility reel, S7 · Certifications & compliance, S8 · Mid-page lead capture — high-intent enquiry form, S9 · Leadership & company authority, S10 · Client testimonials & partner logos
this is i want to create in home page, i want all spec to create homepage

---

1. Colors

Primary Color: #2639ED (Blue)
Secondary Color: #FF6B6B (Coral Red)
Text Color: #333333 (Dark Gray)
Light Text Color: #666666 (Gray)
Background Color: #FFFFFF (White)
Section Background: #F8F9FA (Light Gray)
Button Colors:

Primary Button: #2639ED (Blue)
Secondary Button: #FF6B6B (Coral Red)
Button Text: #FFFFFF (White)

2. Fonts

Font Family:

Primary: 'Inter', sans-serif (Used for body text)
Secondary: 'Playfair Display', serif (Used for headings)

Font Sizes:

H1: 48px (Bold, 700)
H2: 36px (Bold, 700)
H3: 28px (Semi-Bold, 600)
H4: 24px (Semi-Bold, 600)
H5: 20px (Medium, 500)
H6: 18px (Medium, 500)
Body Text: 16px (Regular, 400)
Small Text: 14px (Regular, 400)

3. Header Tags

H1: Used for main section titles (e.g., "We bring solutions to make life easier.")
H2: Used for sub-section titles (e.g., "We are trusted by over a million customers.")
H3: Used for process steps (e.g., "Collect Ideas")
H4: Used for team member names (e.g., "Coriss Ambady")
H5: Used for stats (e.g., "Completed Projects")
H6: Used for contact details (e.g., "Address")

4. Background Colors

Body Background: #FFFFFF (White)
Section Backgrounds:

Light Gray: #F8F9FA
Dark Sections: #2639ED (Blue) or #1A1A1A (Black)

Card Background: #FFFFFF (White with shadow)

5. Buttons & Links

Primary Button:

Background: #2639ED
Text: #FFFFFF
Hover: #1A23C5

Secondary Button:

Background: #FF6B6B
Text: #FFFFFF
Hover: #E55A5A

Links:

Color: #2639ED
Hover: #1A23C5

6. Spacing & Layout

Section Padding: 80px 0
Container Max-Width: 1200px
Margin: 0 auto

7. Additional Styling

Border Radius: 8px (for cards and buttons)
Box Shadow: 0 4px 20px rgba(0, 0, 0, 0.05)
Transition Effects: 0.3s ease (for buttons and hover states)

Summary Table

Styling Details

      Category
      Details




      Primary Color
      #2639ED (Blue)


      Secondary Color
      #FF6B6B (Coral Red)


      Text Color
      #333333 (Dark Gray)


      Background
      #FFFFFF (White), #F8F9FA (Light Gray)


      Font Family
      'Inter', sans-serif (Body), 'Playfair Display', serif (Headings)


      H1 Size
      48px (Bold)


      H2 Size
      36px (Bold)


      Button Styles
      Primary: #2639ED, Secondary: #FF6B6B


      Border Radius
      8px


      Box Shadow
      0 4px 20px rgba(0, 0, 0, 0.05)

---

### Drag and drop

modular, drag-and-drop page builder for blogs and pages in Next.js, with reusable blocks like sliders, about us, logo sliders, testimonials, etc. The system will use Zustand for state management (to track blocks, layout, and content) and NeonDB to save page templates and block configurations.

Core Features of the Page Builder

1. Drag-and-Drop Interface

Visual Editor: Drag blocks from a sidebar and drop them into the canvas.
Responsive Preview: Toggle between desktop, tablet, and mobile views.
Block Reordering: Drag to rearrange blocks.
Nested Blocks: Support for columns, tabs, or accordions inside blocks.

2.  Block Library
    Pre-built, customizable blocks for common sections:

          Block Type
          Description
          Customizable Fields




          Hero Slider
          Full-width image/text slider with navigation dots/arrows.
          Images, headlines, CTAs, autoplay speed.


          About Us
          Text + image section (e.g., company story, mission).
          Title, description, image, alignment.


          Logo Slider
          Horizontal slider for client/partner logos.
          Logos, speed, pause on hover.


          Testimonial
          Customer quotes with avatars.
          Testimonials, avatars, layout (grid/carousel).


          Feature Grid
          Grid of features/icons (e.g., "Why Choose Us").
          Icons, titles, descriptions, columns.


          Call-to-Action
          Button + text section (e.g., "Get a Free Consultation").
          Headline, subtext, button text, link.


          Blog Grid
          Display recent blog posts in a grid.
          Number of posts, layout, categories.


          Contact Form
          Embeddable form with fields (name, email, message).
          Fields, labels, success message.


          FAQ
          Accordion-style Q&A section.
          Questions, answers, open/close behavior.


          Team Members
          Grid of team profiles with photos and roles.
          Names, roles, photos, social links.


          Pricing Table
          Compare pricing tiers (e.g., Basic/Pro/Enterprise).
          Tiers, features, prices, buttons.


          Video Embed
          Embed YouTube/Vimeo videos.
          URL, autoplay, loop.


          Custom HTML
          For advanced users to add raw HTML/JS.
          HTML/JS code.

3.  Block Customization

Inline Editing: Click on any block to edit its content directly in the canvas.
Style Controls:

Background color/image.
Padding/margin.
Typography (font, size, color).
Border/radius.

Conditional Logic: Show/hide blocks based on user role or device type.

4. Page Management

Templates: Save page layouts as templates (e.g., "Homepage V1", "Blog Layout").
Versioning: Auto-save and restore previous versions (NeonDB).
SEO Settings: Meta title, description, and OpenGraph tags per page.
Publish/Unpublish: Draft mode vs. live mode.

5. Dynamic Data

NeonDB Integration:

Store block content (e.g., testimonials, team members) in the database.
Fetch dynamic data (e.g., recent blog posts, client logos).

API Endpoints:

Fetch blocks: GET /api/blocks?pageId=123.
Save page: POST /api/pages.

6. Collaboration (Optional)

Multi-User Editing: Real-time collaboration (e.g., using Yjs or Liveblocks).
Comments: Add comments to blocks for team feedback.

7. Performance

Lazy Loading: Load blocks as they enter the viewport.
Optimized Images: Use Next.js Image component for automatic optimization.
Code Splitting: Dynamically import block components.

Tech Stack

      Layer
      Technology
      Purpose




      Frontend
      Next.js (App Router)
      SSR, ISR, and client-side rendering.


      State
      Zustand
      Manage blocks, layout, and editor state.


      Drag-and-Drop
      react-dnd or dnd-kit
      Smooth drag-and-drop.


      Database
      NeonDB (PostgreSQL)
      Store pages, blocks, and dynamic content.


      Styling
      Tailwind CSS
      Utility-first styling.


      Rich Text
      TipTap or Lexical
      WYSIWYG editor for text blocks.


      Forms
      React Hook Form
      Form handling.


      Animations
      Framer Motion
      Smooth transitions for blocks.
