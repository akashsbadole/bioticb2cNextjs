# WCommerce Catalogue — Architecture Guide

## System Architecture

```mermaid
graph TB
    subgraph Client
        B[Browser]
    end

    subgraph "CDN / Reverse Proxy"
        RP[Nginx / Caddy]
    end

    subgraph "Next.js Application"
        MW[Middleware]
        API[API Routes]
        SSG[Static Generation]
        ISR[ISR Cache]
    end

    subgraph "Database"
        PG[(PostgreSQL / SQLite)]
    end

    subgraph "External Services"
        SMTP[SMTP Server]
        PAYU[PayU Gateway]
    end

    B --> RP
    RP --> MW
    MW --> API
    API --> PG
    API --> SMTP
    API --> PAYU
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Browser
    participant MW as Middleware
    participant API as API Route
    participant DB as Database

    U->>B: Enter credentials
    B->>API: POST /api/auth/login
    API->>DB: Verify credentials
    API->>DB: Create session (jti, IP, user agent)
    API-->>B: Set JWT cookie + session
    B->>MW: Subsequent requests (cookie)
    MW->>MW: Verify JWT signature
    MW->>MW: Check session not revoked
    MW->>API: Forward request with user context
    API->>DB: Process request
    API-->>B: Response
    B->>API: POST /api/auth/logout
    API->>DB: Revoke session
    API-->>B: Clear cookie
```

## Database ER Diagram

```mermaid
erDiagram
    Store ||--o{ Product : has
    Store ||--o{ Category : has
    Store ||--o{ BlogPost : has
    Store ||--o{ Banner : has
    Store ||--o{ Menu : has
    Store ||--o{ PageContent : has
    Store ||--o{ SiteSetting : has

    Category ||--o{ Product : contains
    Product ||--o{ OrderItem : contains
    Order ||--o{ OrderItem : contains
    User ||--o{ Order : places
    User ||--o{ Session : has
    User ||--o{ ActivityLog : generates
    User ||--o{ Address : has
    User ||--o{ Review : writes
    Product ||--o{ Review : has
    Product ||--o{ ProductVariant : has
    Product ||--o{ CartItem : has
    Cart ||--o{ CartItem : contains
    User ||--o{ Cart : has
    Order ||--o{ ReturnRequest : has
    Order ||--o{ Payment : has
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User/Browser
    participant MW as Middleware
    participant API as API Route
    participant DB as Database

    U->>API: POST /api/auth/login (email, password)
    API->>DB: Verify credentials (bcrypt)
    API->>DB: Create Session (jti, IP, user agent, 7-day expiry)
    API-->>U: Set JWT cookie + session
    U->>MW: Request with cookie
    MW->>MW: Verify JWT signature
    MW->>MW: Check session not revoked
    MW->>API: Forward with user context
    API->>DB: Process request
    API-->>U: Response
    U->>API: POST /api/auth/logout
    API->>DB: Revoke session (set revokedAt)
    API-->>U: Clear cookie
```

## Database ER Diagram

```mermaid
erDiagram
    Store ||--o{ Product : has
    Store ||--o{ Category : has
    Store ||--o{ BlogPost : has
    Store ||--o{ Banner : has
    Store ||--o{ Menu : has
    Store ||--o{ PageContent : has
    Store ||--o{ SiteSetting : has
    Store ||--o{ Popup : has
    Store ||--o{ Brand : has
    Store ||--o{ Coupon : has

    Category ||--o{ Product : contains
    Product ||--o{ ProductVariant : has
    Product ||--o{ Review : has
    Product ||--o{ CartItem : has
    Product ||--o{ OrderItem : has

    User ||--o{ Order : places
    User ||--o{ Session : has
    User ||--o{ ActivityLog : generates
    User ||--o{ Address : has
    User ||--o{ Review : writes
    User ||--o{ Cart : has
    User ||--o{ ReturnRequest : requests

    Order ||--o{ OrderItem : contains
    Order ||--o{ ReturnRequest : has
    Order ||--o{ Payment : has
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User/Browser
    participant MW as Middleware
    participant API as API Route
    participant DB as Database

    U->>API: POST /api/auth/login (email, password)
    API->>DB: Verify credentials (bcrypt)
    API->>DB: Create Session (jti, IP, user agent, 7-day expiry)
    API-->>U: Set JWT cookie (includes jti)
    U->>MW: Request with cookie
    MW->>MW: Verify JWT signature
    MW->>MW: Check session not revoked
    MW->>API: Forward with user context
    API->>DB: Process request
    API-->>U: Response
    U->>API: POST /api/auth/logout
    API->>DB: Revoke session (set revokedAt)
    API-->>U: Clear cookie
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        subgraph "Client"
            B[Browser]
        end

        subgraph "CDN / Edge"
            CDN[CDN - Static Assets]
        end

        subgraph "Reverse Proxy"
            RP[Nginx / Caddy]
            SSL[SSL Termination]
        end

        subgraph "Application Server"
            NODE[Node.js / Next.js]
            API[API Routes]
            SSG[Static Generation]
            ISR[ISR Cache]
        end

        subgraph "Database"
            PG[(PostgreSQL)]
        end

        subgraph "External Services"
            SMTP[SMTP Server]
            PAYU[PayU Gateway]
        end

        B[Browser] --> CDN
        B --> RP
        RP --> NODE
        NODE --> PG
        NODE --> SMTP
        NODE --> PAYU
        CDN --> NODE
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User/Browser
    participant MW as Middleware
    participant API as API Route
    participant DB as Database

    U->>API: POST /api/auth/login (email, password)
    API->>DB: Verify credentials (bcrypt)
    API->>DB: Create Session (jti, IP, user agent, 7-day expiry)
    API-->>U: Set JWT cookie (includes jti)
    U->>MW: Request with cookie
    MW->>MW: Verify JWT signature
    MW->>MW: Check session not revoked
    MW->>API: Forward with user context
    API->>DB: Process request
    API-->>U: Response
    U->>API: POST /api/auth/logout
    API->>DB: Revoke session (set revokedAt)
    API-->>U: Clear cookie
```

## Database ER Diagram

```mermaid
erDiagram
    Store ||--o{ Product : has
    Store ||--o{ Category : has
    Store ||--o{ BlogPost : has
    Store ||--o{ Banner : has
    Store ||--o{ Menu : has
    Store ||--o{ PageContent : has
    Store ||--o{ SiteSetting : has
    Store ||--o{ Popup : has
    Store ||--o{ Brand : has
    Store ||--o{ Coupon : has

    Category ||--o{ Product : contains
    Product ||--o{ ProductVariant : has
    Product ||--o{ Review : has
    Product ||--o{ CartItem : has
    Product ||--o{ OrderItem : has

    User ||--o{ Order : places
    User ||--o{ Session : has
    User ||--o{ ActivityLog : generates
    User ||--o{ Address : has
    User ||--o{ Review : writes
    User ||--o{ Cart : has
    User ||--o{ ReturnRequest : requests

    Order ||--o{ OrderItem : contains
    Order ||--o{ ReturnRequest : has
    Order ||--o{ Payment : has
    Cart ||--o{ CartItem : contains
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User/Browser
    participant MW as Middleware
    participant API as API Route
    participant DB as Database

    U->>API: POST /api/auth/login (email, password)
    API->>DB: Verify credentials (bcrypt)
    API->>DB: Create Session (jti, IP, user agent, 7-day expiry)
    API-->>U: Set JWT cookie (includes jti)
    U->>MW: Request with cookie
    MW->>MW: Verify JWT signature
    MW->>MW: Check session not revoked
    MW->>API: Forward with user context
    API->>DB: Process request
    API-->>U: Response
    U->>API: POST /api/auth/logout
    API->>DB: Revoke session (set revokedAt)
    API-->>U: Clear cookie
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client"
        B[Browser]
    end

    subgraph "CDN / Edge"
        CDN[CDN - Static Assets]
    end

    subgraph "Reverse Proxy"
        RP[Nginx / Caddy]
        SSL[SSL Termination]
    end

    subgraph "Application Server"
        NODE[Node.js / Next.js]
        API[API Routes]
        SSG[Static Generation]
        ISR[ISR Cache]
    end

    subgraph "Database"
        PG[(PostgreSQL)]
    end

    subgraph "External Services"
        SMTP[SMTP Server]
        PAYU[PayU Gateway]
    end

    B --> CDN
    B --> RP
    RP --> NODE
    NODE --> PG
    NODE --> SMTP
    NODE --> PAYU
    CDN --> NODE
```

## Key Design Decisions

### Single-Store Architecture

This is a **single-store** B2B/B2C catalogue application. The `Store` model and `DEFAULT_STORE_SLUG` resolution exist only to identify the one operating store. Multi-tenancy (subdomain routing, custom domains, store switching) is intentionally out of scope.

### Session-Based Authentication

Authentication uses JWT tokens with server-side session tracking:
- JWT includes a `jti` (JWT ID) for token-level revocation
- Sessions are stored in the database with IP, user agent, and 7-day expiry
- Admins can list and revoke active sessions
- Logout revokes the session server-side

### API Design

- All endpoints under `/api/*` (no version prefix yet)
- Standardized response format via `src/lib/api-response.ts` (`{ success, data }` / `{ success, error }`)
- OpenAPI 3.0 spec served at `GET /api/docs`
- Rate limiting on critical endpoints (login, contact, newsletter, orders, products)
- Pagination via cursor-based (`?cursor=`) and page-based (`?page=&limit=`) patterns

### Data Flow

```mermaid
flowchart LR
    A[Browser] --> B[Next.js App]
    B --> C[API Routes]
    C --> D[Prisma ORM]
    D --> E[(PostgreSQL)]
    C --> F[SMTP]
    C --> G[PayU Gateway]
    B --> H[Static Generation]
    B --> I[ISR Cache]
```

## Key Design Decisions

### Why SQLite is Default (Dev) and PostgreSQL is Recommended (Prod)

- **SQLite**: Zero configuration, file-based, ideal for development and testing
- **PostgreSQL**: Concurrent writes, connection pooling, `@check` constraints, better scalability
- The project ships both `prisma/schema.prisma` (SQLite) and `prisma/schema.postgres.prisma` (PostgreSQL)

### Session Management

- JWT tokens include a `jti` (JWT ID) for token-level revocation
- Sessions stored in database with IP, user agent, 7-day expiry
- Admins can list and revoke active sessions
- Logout revokes the session server-side

### API Response Contract

All API responses follow a standardized format:

```typescript
// Success
{ success: true, data: T, message?: string, pagination?: PaginationMeta }

// Error
{ success: false, error: string, code?: string, details?: unknown }
```

### Caching Strategy

- **ISR**: Product pages use Incremental Static Regeneration
- **API Cache**: Public read endpoints (`/api/products`, `/api/categories`, `/api/blog`, etc.) have `s-maxage=60, stale-while-revalidate=300`
- **Browser Cache**: Static assets (`_next/static`) have 365-day cache with immutable flag
- **No Redis yet**: Data caching layer is a future enhancement
