# WCommerce Catalogue - User Guide

## Introduction

WCommerce Catalogue is a multi-tenant e-commerce platform that lets businesses create and manage their own online stores. This guide covers the main features for store owners (admins) and customers (buyers).

## Table of Contents

- [For Store Owners (Admins)](#for-store-owners-admins)
  - [Logging In](#admin-login)
  - [Dashboard](#dashboard)
  - [Product Management](#product-management)
  - [Category Management](#category-management)
  - [Order Management](#order-management)
  - [B2B: Enquiries & Quotes](#b2b-enquiries--quotes)
  - [Company Management](#company-management)
  - [Customer Management](#customer-management)
  - [Blog & Content Pages](#blog--content-pages)
  - [Media Library](#media-library)
  - [Banners](#banners)
  - [Coupons & Discounts](#coupons--discounts)
  - [Settings](#settings)
  - [Multi-Store Management](#multi-store-management)
  - [Backup & Restore](#backup--restore)
  - [Import & Export](#import--export)
- [For Customers (Buyers)](#for-customers-buyers)
  - [Browsing Products](#browsing-products)
  - [Shopping Cart & Checkout](#shopping-cart--checkout)
  - [Account & Orders](#account--orders)
  - [B2B Buyer Portal](#b2b-buyer-portal)
  - [Enquiries & Quotes](#enquiries--quotes-buyer)
  - [Contact Form](#contact-form)

---

## For Store Owners (Admins)

### Admin Login

1. Navigate to `/admin`
2. Enter your email and password
3. Click **Login**

The admin dashboard provides full control over your store.

### Dashboard

The dashboard shows:
- **Total Products** - Number of active products
- **Total Orders** - Number of orders received
- **Total Revenue** - Sum of all confirmed orders
- **Enquiries** - New and total enquiry counts
- **Quote Stats** - Sent, accepted, and total quote values
- **Enquiry Trends** - 30-day chart of daily enquiries
- **Recent Activity** - Latest actions performed in the admin

### Product Management

#### Adding a Product

1. Go to **Products** tab
2. Click **Add Product**
3. Fill in:
   - **Name** (required) - Product title
   - **Slug** - Auto-generated from name, editable
   - **Description** - Full product description
   - **Short Description** - Brief summary for listings
   - **Price** (required) - Regular selling price
   - **Compare Price** - Original/struck-through price (optional)
   - **Wholesale Price** - B2B pricing (optional)
   - **SKU** - Stock Keeping Unit identifier
   - **Stock** - Available quantity
   - **Low Stock Threshold** - Alert level for low stock
   - **Category** - Assign to a category
   - **Images** - Upload product images
   - **Specifications** - Technical specs
   - **Min Order Qty** - Minimum order quantity for B2B
   - **WhatsApp Number** - For quick enquiry via WhatsApp
4. Click **Save**

#### Product Variants

For products with options (size, color, etc.):
1. Open a product
2. Go to **Variants** section
3. Add variants with independent pricing, SKU, stock, and images

#### Bulk Actions

Select multiple products to:
- Publish / Unpublish
- Delete (soft) / Restore
- Permanent Delete

#### Trash & Restore

Deleted products go to Trash. You can restore them or permanently delete.

### Category Management

1. Go to **Categories** tab
2. Create categories with name, slug, description, and image
3. Support **hierarchical nesting** (parent/child categories)
4. Categories with active products cannot be deleted

#### Category Landing Pages

Each category has a **rich landing page** with dedicated builder sections:

| Field | Description |
|---|---|
| **Hero** | Large banner with heading, subtext, and optional buttons |
| **Content Split** | Two-column text + image section |
| **Cards** | Feature / info cards grid |
| **CTA** | Call-to-action banner with button |
| **Process** | Step-by-step process flow (up to 4 steps) |
| **Infographic** | Image-rich infographic section |

These fields render on the storefront at `/product/<slug>` (e.g. `/product/khakhra`). Use them to create branded, content-rich category landing pages — no coding required.

Categories also support the full **Page Builder** via the block editor for more complex layouts (26+ block types available).

### Order Management

1. Go to **Orders** tab
2. View all orders with status, customer details, and totals
3. Update order status:
   - Pending > Confirmed > Processing > Shipped > Delivered
   - Or Cancelled
4. Add notes to orders
5. Filter by status or search by order number

### B2B: Enquiries & Quotes

#### Enquiries

- View all product enquiries and contact form submissions
- Update status: New > Contacted > In Progress > Resolved > Closed
- Link enquiries to products and users
- Bulk update status or delete

#### Quotes

1. Go to **Quotes** tab
2. Create formal quotes for customers:
   - Link to an enquiry
   - Add line items with products, quantities, and prices
   - Set validity date
   - Add notes and admin notes
3. Send quotes to customers
4. Track status: Draft > Sent > Accepted > Rejected

### Company Management

- View all registered B2B companies
- Verify companies (grants verified status to all company users)
- Assign pricing tiers: Standard, Silver, Gold, Platinum
- View company users, enquiries, and quotes

### Customer Management

1. Go to **Users** tab
2. View all registered users
3. Manage roles: Admin, Clerk, Buyer
4. Activate/deactivate users
5. Bulk operations: delete, activate, deactivate
6. Import users from CSV

### Blog & Content Pages

#### Blog

1. Go to **Blog** tab
2. Create posts with WYSIWYG editor
3. Add block-based content (26 block types available)
4. Set SEO meta tags, cover image, tags
5. Publish/unpublish workflow

#### Content Pages

1. Go to **Pages** tab
2. Build pages using the **Page Builder** with drag-and-drop blocks:
   - Hero sections
   - Feature grids
   - Testimonials
   - FAQ sections
   - Product carousels
   - Pricing tables
   - Partner logos
   - And 18 more block types
3. Set SEO fields (meta title, description, OG image)
4. Custom JSON schema for advanced SEO

### Media Library

- Upload images, PDFs, CSVs, Excel files
- Organize into folders
- Search and filter by type
- Edit alt text
- 10MB per file, max 20 files per upload

### Banners

- Create homepage banners with title, subtitle, image, and link
- Set sort order for display priority
- Activate/deactivate banners

### Coupons & Discounts

1. Create discount codes:
   - **Percentage** or **Fixed** amount
   - Minimum order value
   - Usage limits (max uses)
   - Date range (start/expiry)
2. Validate coupons at checkout
3. Bulk operations available

### Settings

Configure your store under the **Settings** tab:

- **General**: Site name, description, logo, favicon
- **SMTP**: Email server configuration for notifications
- **B2B**: Enable/disable B2B features, set tier discounts
- **Shipping**: Free, flat rate, or flat-rate-free-above-threshold
- **Tax**: Tax rate configuration
- **Payment**: Razorpay API keys
- **SEO**: Default meta tags, schema.org settings
- **Theme**: Colors, fonts, layout customization

### Multi-Store Management

If you operate multiple stores:
1. Go to **Stores** in admin
2. Create new stores with unique slugs
3. Switch between stores from the admin
4. Each store has isolated data (products, orders, settings)

### Backup & Restore

- **Backup**: Export all data as JSON (products, orders, users, settings, etc.)
- **Restore**: Import from a JSON backup file
- Settings and categories are upserted during restore

### Import & Export

#### CSV Import
- Products, categories, blog posts, users, redirects
- Shopify CSV import supported
- WooCommerce CSV import supported

#### CSV Export
- Export any entity type as CSV download

---

## For Customers (Buyers)

### Browsing Products

1. Visit the store homepage
2. Browse **Featured Products** or navigate to **Catalogue** (`/product`)
3. Use **filters** to narrow by:
   - Category
   - Price range
   - In-stock availability
4. **Search** for products by name or description (opens enquiry modal directly)
5. **Sort** by relevance, price, newest, or name
6. Click a **category** to view its landing page at `/product/<slug>` with hero, cards, CTA, and other sections
7. Click **Enquire** on any product card to open the enquiry modal — fill in quantity and message to send a request directly to the admin

### Shopping Cart & Checkout

1. Click **Add to Cart** on any product
2. View cart from the cart icon in the header
3. Adjust quantities or remove items
4. Click **Checkout**
5. Enter shipping details
6. Apply a **coupon code** if available
7. Choose payment method:
   - Razorpay (online payment)
   - Other configured methods
8. Place order

### Account & Orders

- **Register/Login** to track orders
- View **Order History** with status updates
- Cancel pending orders
- Manage **Saved Addresses**
- Update profile information
- Change password

### B2B Buyer Portal

Navigate to `/portal` after logging in as a B2B buyer:

- **Account Status**: View verification status and pricing tier
- **Active Quotes**: See all received quotes with amounts
- **Inquiry History**: Track submitted enquiries
- **Business Information**: View company details

### Enquiries & Quotes (Buyer)

#### Submitting an Enquiry

1. On any **product card** (category pages, search results, featured products), click **Enquire**
2. Fill in name, email, phone, quantity, and message
3. Submit — admins will respond with a formal quote

#### Responding to Quotes

1. Go to **Portal** > **Quotes**
2. View quote details with line items and totals
3. **Accept** or **Decline** the quote
4. Accepted quotes can proceed to order

### Contact Form

- Visit the **Contact** page
- Fill in name, email, subject, and message
- Submit - you'll receive a confirmation email

---

## Frequently Asked Questions

### How do I reset my password?

1. Click **Forgot Password** on the login page
2. Enter your email address
3. Check your email for a reset link (valid for 1 hour)
4. Click the link and set a new password

### How do I become a B2B buyer?

1. Click **Register** and select B2B registration
2. Provide your company details (name, tax ID, address)
3. Wait for admin verification
4. Once verified, you'll have access to B2B pricing and the Buyer Portal

### What pricing tiers are available?

| Tier | Discount |
|---|---|
| Standard | 0% |
| Silver | 5% |
| Gold | 10% |
| Platinum | 15% |

Tiers are assigned by the admin based on your business relationship.

### How do I track my order?

1. Log in to your account
2. Go to **Orders**
3. Click on an order to see its status and details

### Can I compare products?

Yes. Click the **Compare** icon on up to 4 products to see them side-by-side with specifications and pricing.

### How do I use a coupon code?

1. Add products to your cart
2. Go to Checkout
3. Enter the coupon code in the **Coupon** field
4. Click **Apply** - the discount will be reflected in your total
