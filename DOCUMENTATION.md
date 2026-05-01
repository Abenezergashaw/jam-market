# JAM Supermarket — Full System Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Schema](#5-database-schema)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Routes](#7-api-routes)
8. [Pages & Layouts](#8-pages--layouts)
9. [State Management](#9-state-management-pinia)
10. [Composables & Utilities](#10-composables--utilities)
11. [Components](#11-components)
12. [Order Flow](#12-order-flow)
13. [Payment System](#13-payment-system)
14. [Delivery & Fees](#14-delivery--fees)
15. [Product Reviews](#15-product-reviews)
16. [Image Uploads](#16-image-uploads)
17. [Notifications](#17-notifications)
18. [Styling & Design System](#18-styling--design-system)
19. [Running the Project](#19-running-the-project)
20. [Production Deployment](#20-production-deployment)
21. [Known Limitations](#21-known-limitations)

---

## 1. Project Overview

**JAM Supermarket** is a full-stack grocery delivery platform built with Nuxt 3, Prisma, and PostgreSQL. It supports four user roles with distinct workflows:

- **Customers** — browse products, place orders, track delivery, leave reviews (authenticated via Telegram)
- **Cashiers** — manage orders for their store, verify payments, assign delivery staff
- **Delivery staff** — see assigned orders, mark deliveries complete
- **Admins** — full access: products, categories, stores, users, settings, analytics

Key capabilities:
- Multi-store operations with per-store pricing
- Bank transfer payments (Telebirr, CBE, BOA) with receipt upload and manual verification
- Cash-on-delivery (limited to ≤15 km)
- GPS-based delivery fee calculation (Haversine formula)
- Product gallery with multiple images
- Star ratings and comments (one review per customer per product)
- Telegram notifications to customers on order status changes
- Homepage hero carousel, featured products, trending categories

---

## 2. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Nuxt 3 (SSR enabled) |
| UI | Vue 3 Composition API + Tailwind CSS |
| State | Pinia (`@pinia/nuxt`) |
| ORM | Prisma |
| Database | PostgreSQL (Neon in production) |
| Auth | JWT (`jsonwebtoken`, 30-day expiry) + Bcryptjs |
| Images | Cloudinary |
| Maps | Leaflet |
| Validation | Zod |
| Error tracking | Sentry (`@sentry/nuxt`) |
| Notifications | Telegram Bot API |

---

## 3. Project Structure

```
jam-supermarket/
├── pages/
│   ├── index.vue                    # Homepage
│   ├── login.vue                    # Telegram login
│   ├── search.vue                   # Product search
│   ├── cart.vue                     # Cart + checkout
│   ├── account.vue                  # Customer profile
│   ├── orders.vue                   # My Orders (customer)
│   ├── category/[id].vue            # Category product listing
│   ├── product/[id].vue             # Product detail + reviews
│   ├── admin/
│   │   ├── index.vue                # Dashboard
│   │   ├── login.vue                # Staff login
│   │   ├── orders/index.vue         # All orders list
│   │   ├── orders/[id].vue          # Order detail
│   │   ├── products/index.vue       # Products list
│   │   ├── products/new.vue         # Create product
│   │   ├── products/[id].vue        # Edit product
│   │   ├── products/low-stock.vue   # Low stock alerts
│   │   ├── categories/index.vue
│   │   ├── categories/new.vue
│   │   ├── categories/[id].vue
│   │   ├── hero/index.vue           # Carousel management
│   │   ├── hero/[id].vue
│   │   ├── stores/index.vue
│   │   ├── stores/new.vue
│   │   ├── stores/[id].vue
│   │   ├── users/index.vue
│   │   ├── users/[id].vue
│   │   ├── settings.vue
│   │   └── revenue.vue
│   ├── cashier/
│   │   ├── orders/index.vue
│   │   ├── orders/[id].vue
│   │   ├── products/index.vue
│   │   ├── products/[id].vue
│   │   └── categories/[id].vue
│   └── delivery/
│       ├── orders/index.vue
│       └── orders/[id].vue
│
├── components/
│   ├── ProductCard.vue
│   ├── FeaturedProductCard.vue
│   ├── CategoryCard.vue
│   ├── TrendingCategoryCard.vue
│   ├── SearchBar.vue
│   ├── StarRating.vue
│   ├── ProductReviews.vue
│   ├── MapPicker.vue
│   └── admin/
│       ├── OrderRow.vue
│       ├── ProductForm.vue
│       ├── CategoryForm.vue
│       └── StatsCard.vue
│
├── layouts/
│   ├── default.vue                  # Customer layout
│   ├── admin.vue                    # Admin/cashier/delivery sidebar layout
│   ├── cashier.vue
│   └── delivery.vue
│
├── middleware/
│   ├── auth.ts                      # Requires customer login
│   ├── admin.ts                     # Requires admin|cashier|delivery JWT
│   ├── cashier.ts
│   └── delivery.ts
│
├── stores/
│   ├── admin.js                     # Staff auth store
│   ├── customer.js                  # Customer auth store
│   ├── cart.js                      # Shopping cart
│   └── customerOrders.js            # Customer order history
│
├── composables/
│   ├── useAdminFetch.js             # Fetch wrapper with admin JWT header
│   └── useCustomerFetch.js          # Fetch wrapper with customer JWT header
│
├── server/
│   ├── api/                         # All API endpoints (Nuxt auto-routes)
│   └── utils/
│       ├── auth.js                  # JWT helpers & role guards
│       ├── prisma.js                # Singleton Prisma client
│       ├── telegram.js              # Bot notification helper
│       └── haversine.js             # Distance calculation
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
└── nuxt.config.ts
```

---

## 4. Environment Configuration

Create a `.env` file at the project root with these variables:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# JWT
JWT_SECRET="your-strong-secret-here"

# Telegram
TELEGRAM_BOT_TOKEN="bot123456:ABC-xyz"
NUXT_PUBLIC_TELEGRAM_BOT_USERNAME="YourBotUsername"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Sentry (optional)
SENTRY_AUTH_TOKEN="your-sentry-token"
```

The `nuxt.config.ts` maps these to `runtimeConfig`:

```ts
runtimeConfig: {
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-in-prod',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  public: {
    telegramBotUsername: process.env.NUXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  },
}
```

**Security headers** set in `nuxt.config.ts`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`

---

## 5. Database Schema

### Models

#### `User` — Staff accounts

```prisma
model User {
  id            Int      @id @default(autoincrement())
  email         String   @unique
  passwordHash  String
  role          String   // "admin" | "cashier" | "delivery"
  name          String?
  isActive      Boolean  @default(true)
  storeId       Int?
  permissions   String[] // e.g. ["orders:approve","orders:cancel","orders:dispatch","products:create"]
  createdAt     DateTime @default(now())

  store         Store?   @relation(fields: [storeId], references: [id])
}
```

#### `Customer` — Telegram-authenticated shoppers

```prisma
model Customer {
  id         Int      @id @default(autoincrement())
  telegramId BigInt   @unique
  firstName  String
  lastName   String?
  username   String?
  phone      String?
  photoUrl   String?
  createdAt  DateTime @default(now())

  orders     Order[]
  reviews    ProductReview[]
}
```

#### `Product`

```prisma
model Product {
  id                  Int      @id @default(autoincrement())
  name                String
  description         String?
  price               Decimal
  costPrice           Decimal?            // visible to admin only
  imageUrl            String?
  stock               Int      @default(0)
  brand               String?
  unit                String?             // e.g. "kg", "pack"
  weight              String?
  countryOfOrigin     String?
  storageInstructions String?
  expiryDate          DateTime?
  lowStockThreshold   Int      @default(10)
  isFeatured          Boolean  @default(false)
  categoryId          Int?

  category  Category?       @relation(fields: [categoryId], references: [id])
  images    ProductImage[]
  reviews   ProductReview[]
}
```

#### `ProductImage`

```prisma
model ProductImage {
  id        Int    @id @default(autoincrement())
  productId Int
  url       String
  position  Int    @default(0)

  product Product @relation(fields: [productId], references: [id], onDelete: Cascade)
}
```

#### `Category`

```prisma
model Category {
  id         Int       @id @default(autoincrement())
  name       String
  slug       String    @unique
  imageUrl   String?
  isTrending Boolean   @default(false)

  products Product[]
}
```

#### `Order`

```prisma
model Order {
  id                   Int           @id @default(autoincrement())
  customerName         String
  phone                String
  address              String
  notes                String?
  status               OrderStatus   @default(PENDING)
  paymentMethod        String        // CASH | TELEBIRR | CBE | BOA
  paymentStatus        PaymentStatus @default(PENDING)
  receiptImageUrl      String?
  paymentReferenceCode String?
  paymentNote          String?
  paymentVerifiedAt    DateTime?
  paymentVerifiedById  Int?
  totalPrice           Decimal
  deliveryFee          Decimal       @default(0)
  lat                  String?
  lng                  String?
  customerId           Int?
  storeId              Int?
  deliveryPersonId     Int?
  createdAt            DateTime      @default(now())

  customer         Customer? @relation(...)
  store            Store?    @relation(...)
  paymentVerifiedBy User?    @relation("PaymentVerifier", ...)
  deliveryPerson   User?    @relation("DeliveryPerson", ...)
  items            OrderItem[]
}

enum OrderStatus   { PENDING CONFIRMED OUT_FOR_DELIVERY DELIVERED CANCELLED }
enum PaymentStatus { PENDING COLLECTED FAILED }
```

#### `OrderItem`

```prisma
model OrderItem {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int
  price     Decimal // snapshot at time of order

  order   Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product @relation(fields: [productId], references: [id])
}
```

#### `ProductReview`

```prisma
model ProductReview {
  id         Int      @id @default(autoincrement())
  productId  Int      @map("product_id")
  customerId Int      @map("customer_id")
  rating     Int                          // 1–5
  comment    String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  product  Product  @relation(...)
  customer Customer @relation(...)

  @@unique([productId, customerId])       // one review per customer per product
  @@map("product_reviews")
}
```

#### `Store`

```prisma
model Store {
  id               Int      @id @default(autoincrement())
  name             String
  address          String?
  lat              Float?
  lng              Float?
  isActive         Boolean  @default(true)
  costPerKm        Float?
  serviceChargePct Float?
  createdAt        DateTime @default(now())

  staff  User[]
  orders Order[]
}
```

#### `StoreSettings` — Global configuration singleton

```prisma
model StoreSettings {
  id                       Int     @id @default(1)
  minOrderAmount           Float   @default(0)
  costPerKm                Float   @default(0)
  serviceChargePct         Float   @default(0)
  estimatedDeliveryMinutes Int     @default(45)
  storeIsOpen              Boolean @default(true)

  // Bank account details for payment instructions
  telebirrAccountNumber String?
  telebirrAccountName   String?
  cbeAccountNumber      String?
  cbeAccountName        String?
  boaAccountNumber      String?
  boaAccountName        String?
}
```

#### `HeroSlide` — Homepage carousel

```prisma
model HeroSlide {
  id        Int     @id @default(autoincrement())
  title     String
  subtitle  String?
  tag       String?
  ctaLabel  String?
  ctaHref   String?
  imageUrl  String?
  position  Int     @default(0)
  isActive  Boolean @default(true)
}
```

#### `DeliveryZone`

```prisma
model DeliveryZone {
  id             Int     @id @default(autoincrement())
  name           String
  centerLat      Float
  centerLng      Float
  radiusKm       Float
  minOrderAmount Float   @default(0)
  deliveryFee    Float
  isActive       Boolean @default(true)
}
```

---

## 6. Authentication & Authorization

### Customer Authentication (Telegram)

1. Customer visits `/login` — Telegram login widget renders using `NUXT_PUBLIC_TELEGRAM_BOT_USERNAME`.
2. Customer clicks the widget — Telegram app opens and authorizes.
3. Telegram returns signed user data to the `onTelegramAuth` callback.
4. Frontend `POST /api/auth/customer/telegram` with the signed data.
5. Server validates HMAC-SHA256 signature against `TELEGRAM_BOT_TOKEN` and checks the auth timestamp is ≤24 hours old.
6. Customer record is upserted (created on first login, updated on re-login).
7. Server returns a JWT (`role: 'customer'`, 30-day expiry).
8. Frontend stores token in `localStorage` (`customer_token`, `customer_user`) via `useCustomerStore`.
9. User is redirected to original destination (or `/`).

### Staff Authentication (Email/Password)

1. Staff visits `/admin/login`.
2. Submits email + password — `POST /api/auth/login`.
3. Server finds user by email, compares bcrypt hash.
4. Returns JWT with `{ userId, email, role, name, storeId, permissions[] }` (30-day expiry).
5. Frontend stores via `useAdminStore`, redirects by role:
   - `admin` → `/admin`
   - `cashier` → `/cashier`
   - `delivery` → `/delivery`
6. On each protected-page load, middleware calls `GET /api/auth/me` to refresh the token and sync any permission changes from the DB.

### Server-Side Role Guards (`server/utils/auth.js`)

| Function | Description |
|----------|-------------|
| `requireAdmin(event)` | JWT must have `role === 'admin'`. Throws 401 otherwise. |
| `requireCustomer(event)` | JWT must have `role === 'customer'`. Throws 401 otherwise. |
| `requireStaff(event)` | Accepts `admin`, `cashier`, or `delivery`. |
| `requireCashier(event, permission?)` | Role must be `cashier` or `admin`. If `permission` is passed, cashiers must have it in their `permissions[]` array. Admins bypass permission check. Throws 403 if permission missing. |
| `requireDelivery(event)` | Role must be `delivery` or `admin`. |
| `getCustomerIfLoggedIn(event)` | Returns customer payload or `null` — never throws. Used for optional auth (e.g., annotating `isOwn` on reviews). |
| `signToken(payload)` | Signs and returns a JWT with 30-day expiry using `JWT_SECRET`. |

### Middleware

| File | Route prefix | What it enforces |
|------|-------------|------------------|
| `middleware/auth.ts` | `/account`, `/orders`, `/cart` | Redirects to `/login?redirect=...` if customer not authenticated |
| `middleware/admin.ts` | `/admin/*` | Requires staff JWT; refreshes session; enforces `admin` or `cashier` or `delivery` role |
| `middleware/cashier.ts` | `/cashier/*` | Requires `cashier` or `admin` role |
| `middleware/delivery.ts` | `/delivery/*` | Requires `delivery` or `admin` role |

---

## 7. API Routes

All routes live under `server/api/`. Nuxt auto-routes based on filename conventions (`[id].get.js`, `index.post.js`, etc.).

### Authentication

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | — | Staff email/password login |
| GET | `/api/auth/me` | Staff JWT | Refresh staff token, sync permissions |
| POST | `/api/auth/customer/telegram` | — | Customer Telegram login |
| GET | `/api/auth/customer/me` | Customer JWT | Get customer info |

### Products

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products` | — | List all products (`?featured`, `?limit`, `?page`) |
| GET | `/api/products/search` | — | Full-text search using `pg_trgm` similarity |
| GET | `/api/products/discover` | — | Featured + trending products for homepage |
| GET | `/api/products/low-stock` | Staff | Products below `lowStockThreshold` |
| GET | `/api/products/[id]` | — (admin sees costPrice) | Single product with category + images |
| POST | `/api/products` | Cashier + `products:create` | Create product |
| PATCH/PUT | `/api/products/[id]` | Cashier | Update product |
| DELETE | `/api/products/[id]` | Admin | Delete product |

### Product Reviews

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/products/[id]/reviews` | Optional | Paginated reviews + summary (`page`, `limit=5`) |
| POST | `/api/products/[id]/reviews` | Customer | Upsert own review (rating 1–5, optional comment ≤1000 chars) |
| DELETE | `/api/products/[id]/reviews/[reviewId]` | Customer (owner) | Delete own review |

**Reviews GET response:**
```json
{
  "summary": { "avgRating": 4.2, "count": 38, "distribution": { "1":2, "2":3, "3":5, "4":12, "5":16 } },
  "reviews": [
    {
      "id": 14, "rating": 5, "comment": "Great!", "isOwn": false,
      "createdAt": "...", "updatedAt": "...",
      "customer": { "id": 3, "displayName": "John D." }
    }
  ],
  "page": 1, "totalPages": 8, "total": 38
}
```

### Categories

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/categories` | — | All categories |
| POST | `/api/categories` | Cashier | Create category |
| PUT | `/api/categories/[id]` | Cashier | Update category |
| DELETE | `/api/categories/[id]` | Admin | Delete category |

### Orders

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/orders` | — | Place new order |
| GET | `/api/orders` | Staff | Paginated list; cashiers see only their store's orders |
| GET | `/api/orders/[id]` | Staff | Order detail with items, customer, payment info |
| PATCH | `/api/orders/[id]/status` | Staff (permission-gated) | Advance order status |
| PATCH | `/api/orders/[id]/payment` | Cashier | Mark payment `COLLECTED` or `FAILED` |
| PATCH | `/api/admin/orders/[id]/assign` | Cashier + `orders:dispatch` | Assign delivery person |
| GET | `/api/customer/orders` | Customer | Customer's own order history |

**Status transition permissions:**

| From | To | Required permission |
|------|----|-------------------|
| PENDING | CONFIRMED | `orders:approve` |
| PENDING | CANCELLED | `orders:cancel` |
| CONFIRMED | OUT_FOR_DELIVERY | `orders:dispatch` |
| CONFIRMED | CANCELLED | `orders:cancel` |
| OUT_FOR_DELIVERY | DELIVERED | Delivery staff (assigned) |
| OUT_FOR_DELIVERY | CONFIRMED | `orders:cancel` or admin |

### Delivery Staff

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/delivery/orders` | Delivery | Orders assigned to this staff member |
| GET | `/api/delivery/orders/[id]` | Delivery | Single assigned order |
| PATCH | `/api/delivery/orders/[id]/status` | Delivery | Mark as `DELIVERED` only |

### Admin

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/dashboard/stats` | Admin | Summary stats (orders, revenue, alerts) |
| GET | `/api/dashboard/analytics` | Admin | Detailed analytics |
| GET | `/api/admin/revenue` | Admin | Revenue breakdown |
| GET | `/api/admin/orders/export` | Admin | Export orders (CSV or JSON) |
| GET/POST | `/api/admin/users` | Admin | List / create staff accounts |
| GET/PUT/DELETE | `/api/admin/users/[id]` | Admin | Get / update / delete user |
| GET/POST | `/api/admin/stores` | Admin | Stores management |
| PUT/DELETE | `/api/admin/stores/[id]` | Admin | Update / delete store |
| GET | `/api/stores` | — | Public store list |
| GET | `/api/settings` | — | Global settings |
| PUT | `/api/admin/settings` | Admin | Update settings |
| GET/POST | `/api/hero-slides` | Admin (write) | Hero carousel management |
| PUT/DELETE | `/api/hero-slides/[id]` | Admin | Update / delete slide |

### Uploads

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/upload/image` | Staff | Upload product image to Cloudinary |
| POST | `/api/upload/receipt` | Customer | Upload payment receipt (max 10 MB, JPEG/PNG/WebP) |

### Payment (stub)

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/payment/verify` | — | Reference code check — returns 503 (not yet integrated) |

---

## 8. Pages & Layouts

### Layouts

| File | Used by | Description |
|------|---------|-------------|
| `layouts/default.vue` | Customer pages | Top nav, cart icon, search bar |
| `layouts/admin.vue` | Admin pages | Sidebar with role-aware nav items |
| `layouts/cashier.vue` | Cashier pages | Sidebar (orders, products, categories) |
| `layouts/delivery.vue` | Delivery pages | Minimal sidebar (orders only) |

### Customer Pages

| Route | Page | Auth required |
|-------|------|--------------|
| `/` | Homepage (hero, featured, categories) | No |
| `/login` | Telegram login widget | No |
| `/search` | Product search + filters | No |
| `/category/[id]` | Products in a category | No |
| `/product/[id]` | Product detail + reviews + add to cart | No |
| `/cart` | Cart review + checkout form | Yes (auth middleware) |
| `/account` | Customer profile | Yes |
| `/orders` | My orders with status tracking | Yes |

### Admin Pages (`/admin/*`)

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard: stats cards, recent orders, low-stock alerts |
| `/admin/login` | Staff login form |
| `/admin/orders` | All orders (filterable by status, payment method, pagination) |
| `/admin/orders/[id]` | Full order detail: items with images, customer info, map, payment panel, status transitions, delivery assignment |
| `/admin/products` | Products table (search, filter) |
| `/admin/products/new` | Create product form |
| `/admin/products/[id]` | Edit product (images, stock, pricing, details) |
| `/admin/products/low-stock` | Products below threshold |
| `/admin/categories` | Categories list |
| `/admin/categories/new` | Create category |
| `/admin/categories/[id]` | Edit category |
| `/admin/hero` | Homepage carousel slide list |
| `/admin/hero/[id]` | Edit hero slide |
| `/admin/stores` | Store list |
| `/admin/stores/new` | Create store |
| `/admin/stores/[id]` | Edit store (address, coords, pricing) |
| `/admin/users` | Staff accounts list |
| `/admin/users/[id]` | Edit user (role, store, permissions) |
| `/admin/settings` | Global settings: fees, bank accounts, open/closed toggle |
| `/admin/revenue` | Revenue analytics charts |

### Cashier Pages (`/cashier/*`)

| Route | Description |
|-------|-------------|
| `/cashier/orders` | Store-specific orders list |
| `/cashier/orders/[id]` | Order detail: items with images, payment verification, delivery assignment, status actions |
| `/cashier/products` | Product management |
| `/cashier/products/[id]` | Edit product |
| `/cashier/categories/[id]` | Category detail |

### Delivery Pages (`/delivery/*`)

| Route | Description |
|-------|-------------|
| `/delivery/orders` | Assigned orders (stats: pending / confirmed / out for delivery / delivered today) |
| `/delivery/orders/[id]` | Order detail: items with images, customer contact, map, "Mark as Delivered" button |

---

## 9. State Management (Pinia)

### `useAdminStore` (`stores/admin.js`)

Manages staff (admin / cashier / delivery) session.

```js
// State
token: string | null
user: { id, email, role, name, storeId, permissions: string[] } | null

// Actions
login(email, password)    // POST /api/auth/login → stores token
logout()                  // clears store, redirects to /admin/login
hydrate()                 // restores from localStorage on app init
refreshSession()          // GET /api/auth/me → updates permissions from DB
```

### `useCustomerStore` (`stores/customer.js`)

Manages customer (Telegram) session.

```js
// State
token: string | null
user: { id, firstName, lastName, username, photoUrl, phone } | null

// Getters
isAuthenticated  // !!token
fullName         // firstName + ' ' + lastName

// Actions
loginWithTelegram(telegramData)  // POST /api/auth/customer/telegram
logout()
hydrate()
```

### `useCartStore` (`stores/cart.js`)

Shopping cart, persisted to `localStorage` (key: `jam_cart`).

```js
// State
items: Array<{ id, name, price, imageUrl, quantity }>

// Getters
totalItems    // sum of all quantities
totalPrice    // sum of price * quantity
isEmpty

// Actions
addItem(product)              // adds or increments quantity by 1
removeItem(productId)
updateQty(productId, qty)     // sets exact quantity (removes if qty <= 0)
clear()
hydrate()
```

### `useCustomerOrdersStore` (`stores/customerOrders.js`)

Customer's order history, persisted to `localStorage` (key: `jam_my_orders`).

```js
// State
orders: Order[]
loading: boolean

// Actions
addOrder(order)       // optimistic insert after successful checkout
hydrate()             // loads from server if authenticated, else from localStorage
fetchFromServer()     // GET /api/customer/orders
```

---

## 10. Composables & Utilities

### `useAdminFetch` (`composables/useAdminFetch.js`)

Wraps `$fetch` with the staff JWT `Authorization` header.

```js
const { adminFetch } = useAdminFetch()
const orders = await adminFetch('/api/orders', { query: { page: 1 } })
```

### `useCustomerFetch` (`composables/useCustomerFetch.js`)

Same pattern for customer JWT.

```js
const { customerFetch } = useCustomerFetch()
await customerFetch('/api/products/1/reviews', { method: 'POST', body: { rating: 5 } })
```

### Server Utilities

#### `server/utils/auth.js`
All JWT and role-guard functions (see [Section 6](#6-authentication--authorization)).

#### `server/utils/prisma.js`
Singleton Prisma client. In development uses a global variable to prevent multiple hot-reload instances.

#### `server/utils/haversine.js`

```js
haversineKm(lat1, lng1, lat2, lng2) → number
```
Calculates the great-circle distance between two GPS coordinates in km using the Haversine formula with Earth radius 6371 km.

#### `server/utils/telegram.js`

```js
sendTelegramMessage(chatId, text) → Promise<void>
```
Posts a message to a customer's Telegram chat via the Bot API. Errors are sent to Sentry but do not throw — notifications are non-critical.

---

## 11. Components

### `StarRating.vue`

Reusable star rating widget for both input and display.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | Number | `0` | Current rating (0 = unset) |
| `readonly` | Boolean | `false` | Display-only mode |
| `size` | String | `'md'` | `'sm'` (14px), `'md'` (20px), `'lg'` (28px) |

- Input mode: 5 interactive buttons with hover highlighting; emits `update:modelValue`.
- Readonly mode: supports fractional (half-star) display using a clipped SVG overlay.
- Colors: filled = `#629e3a` (forest green), empty = zinc-200.

### `ProductReviews.vue`

Full reviews section displayed on product detail page.

**Props:** `productId: Number`

**Features:**
- Loading skeleton (3 pulse rows)
- Summary block: large average score + distribution bars for each star level
- Write-a-review card: guest prompt (sign-in link) or logged-in form (star picker + textarea + submit/update + remove)
- Review list: avatar initials + display name + star rating + date + comment + "edited" badge
- Pagination via "Load more" button (5 per page)
- Upsert: submitting a second review updates the existing one

### `MapPicker.vue`

Leaflet map for the checkout page delivery address selection.

- Renders an interactive map; customer clicks to place a marker.
- Emits `{ lat, lng }` on pin placement.
- Used to calculate delivery fee and validate cash payment distance.

### `admin/OrderRow.vue`

Reusable order card for the admin/cashier orders list. Shows:
- Order ID, status badge, payment status badge, date
- Customer name, phone, address
- Product thumbnails (32×32) + name + qty + line total
- Order total
- Quick-action buttons driven by `TRANSITIONS` map

### `admin/ProductForm.vue`

Shared form for creating and editing products. Handles:
- Basic fields (name, description, price, cost price, stock, brand, unit)
- Primary image + gallery upload to Cloudinary
- Category selector
- Detail fields (weight, country, storage, expiry)
- Low-stock threshold
- Featured toggle

### `admin/StatsCard.vue`

Dashboard stat card with a number, label, and optional trend/icon.

---

## 12. Order Flow

```
Customer                    Server                         Staff
   │                           │                              │
   │── Add items to cart ──────▶│                              │
   │── Fill checkout form ─────▶│                              │
   │   (name, phone, address,   │                              │
   │    payment method,         │                              │
   │    GPS coordinates)        │                              │
   │                           │── Validate with Zod          │
   │                           │── Check stock availability   │
   │                           │── Calculate delivery fee     │
   │                           │   (Haversine + store rates)  │
   │                           │── Create Order + OrderItems  │
   │                           │   (atomic, stock decremented)│
   │◀── Order confirmation ────│                              │
   │                           │                              │
   │                           │◀─ GET /api/orders ──────────│
   │                           │── Returns order list ───────▶│
   │                           │                              │
   │                           │◀─ PATCH status=CONFIRMED ───│
   │                           │── Telegram notification ─────▶ Customer
   │                           │                              │
   │                           │◀─ Assign delivery person ───│
   │                           │◀─ PATCH status=OUT_FOR_DELIVERY
   │                           │── Telegram notification ─────▶ Customer
   │                           │                              │
   │                           │◀─ PATCH status=DELIVERED ───│ (delivery staff)
   │                           │── Telegram notification ─────▶ Customer
```

**Status pipeline:**

```
PENDING → CONFIRMED → OUT_FOR_DELIVERY → DELIVERED
    └─────────────────────────────────→ CANCELLED
```

Reversions (e.g., CONFIRMED → PENDING) are allowed for admin/cashier with appropriate permissions.

---

## 13. Payment System

### Supported Methods

| Method | Label | Type |
|--------|-------|------|
| `CASH` / `COD` | Cash on Delivery | Cash |
| `TELEBIRR` | Telebirr | Bank transfer |
| `CBE` | Commercial Bank of Ethiopia | Bank transfer |
| `BOA` | Bank of Abyssinia | Bank transfer |

### Cash on Delivery

- Available only when the customer's delivery location is ≤15 km from the assigned store.
- Server enforces this — throws a 400 error if exceeded.
- `paymentStatus` is set `COLLECTED` when the order is delivered (or manually by cashier).

### Bank Transfer (Telebirr / CBE / BOA)

1. Customer selects a bank method at checkout.
2. Checkout page displays the store's account number and name (from `StoreSettings`).
3. Customer transfers money externally, then either:
   - **Uploads a screenshot** — `POST /api/upload/receipt` → Cloudinary returns URL → stored as `receiptImageUrl`.
   - **Enters a reference/transaction code** — stored as `paymentReferenceCode`.
4. Order is submitted with `paymentStatus: PENDING`.
5. Cashier views the order, reviews the receipt image or reference code, then:
   - `PATCH /api/orders/[id]/payment` with `{ paymentStatus: 'COLLECTED', note?: '...' }`
   - or `{ paymentStatus: 'FAILED', note: 'reason' }`
6. Verification is logged: `paymentVerifiedAt` timestamp + `paymentVerifiedById` (cashier's user ID).

### Payment Status Flow

```
PENDING (order created)
  ↓ cashier reviews
COLLECTED  ← payment confirmed, order proceeds
FAILED     ← payment rejected, note added, order may be cancelled
```

---

## 14. Delivery & Fees

### Fee Calculation

Delivery fee is calculated server-side on order creation:

```
fee = (distance_km × cost_per_km) + (subtotal × service_charge_pct / 100)
```

- `distance_km` — Haversine distance between customer GPS coordinates and assigned store coordinates.
- `cost_per_km` and `service_charge_pct` — taken from the store record first; falls back to `StoreSettings` globals if not set.
- Result stored as `deliveryFee` on the order.

### Distance Constraint

Cash payments are rejected server-side if `distance_km > 15`. The checkout page also shows a warning before submission.

### Delivery Assignment

1. Cashier clicks "Mark Out for Delivery" on an order.
2. A modal appears to select a delivery staff member (filtered by `role === 'delivery'` and optionally `storeId`).
3. `PATCH /api/admin/orders/[id]/assign` sets `deliveryPersonId`.
4. Status is updated to `OUT_FOR_DELIVERY`.
5. The delivery person sees the order in their `/delivery/orders` list.

### Delivery Staff View

- Lists only orders where `deliveryPersonId === their userId`.
- Shows customer name, phone (clickable `tel:` link), address, delivery notes, GPS map.
- Single action: "Mark as Delivered" → `PATCH /api/delivery/orders/[id]/status` with `{ status: 'DELIVERED' }`.

---

## 15. Product Reviews

Each customer can submit one review per product (upsert on repeat submission).

### Data Flow

```
Customer selects star rating (1–5)
  + optional comment (max 1000 chars)
  → POST /api/products/[id]/reviews
  → Server upserts on (productId, customerId) unique key
  → Reviews reloaded (page 1)

GET /api/products/[id]/reviews?page=1&limit=5
  → Returns:
      summary: { avgRating, count, distribution: { "1":n, ..., "5":n } }
      reviews: [{ id, rating, comment, createdAt, updatedAt, isOwn, customer: { displayName } }]
      page, totalPages, total
```

- `isOwn` flag is annotated server-side using `getCustomerIfLoggedIn` — no extra client request needed.
- `displayName` is computed as `firstName + (lastName ? ' ' + lastName[0] + '.' : '')` on the server.
- The product detail page also shows a summary (`avgRating`, `reviewCount`) inline below the price, sourced from `GET /api/products/[id]` which runs a parallel `aggregate` query.

### Editing & Deletion

- Submitting a new review when one already exists updates it (upsert).
- The form pre-fills with the existing rating and comment when the current user's review is in the loaded page.
- "Remove" button calls `DELETE /api/products/[id]/reviews/[reviewId]` — server verifies ownership (403 if not owner).

---

## 16. Image Uploads

All uploads go to Cloudinary.

### Product Images (`POST /api/upload/image`)

- Auth: staff (cashier or admin).
- Accepts multipart form data with an `image` file field.
- No hard file size limit documented (Cloudinary enforces 10 MB by default).
- Returns `{ url }` (Cloudinary secure URL).
- Products support one primary `imageUrl` + multiple `ProductImage` gallery entries with `position` ordering.

### Payment Receipts (`POST /api/upload/receipt`)

- Auth: customer.
- Max file size: 10 MB.
- Accepted types: JPEG, PNG, WebP.
- Returns `{ url }` stored as `order.receiptImageUrl`.
- The receipt URL is shown to cashiers in the payment panel as a clickable, zoomable image.

---

## 17. Notifications

Customer Telegram notifications are sent on these order status transitions:

| Status | Message sent to customer |
|--------|--------------------------|
| `CONFIRMED` | Order confirmed, preparing your items |
| `OUT_FOR_DELIVERY` | Order is on its way |
| `DELIVERED` | Order delivered |
| `CANCELLED` | Order cancelled |

Implementation (`server/utils/telegram.js`):
- Uses the Telegram Bot API `sendMessage` method.
- `chatId` is the customer's `telegramId` (stored at login).
- Errors are reported to Sentry and swallowed — a failed notification never fails the main request.

---

## 18. Styling & Design System

### Colors

```js
// tailwind.config.js
brand: {                  // Red — primary actions, badges, buttons
  50: '#fef2f2',
  500: '#e73f32',
  ...
}
forest: {                 // Green — success states, stock badges, reviews
  50: '#f3f7ee',
  400: '#629e3a',
  500: '#3b5323',
  ...
}
```

### Component Classes (global CSS)

| Class | Description |
|-------|-------------|
| `.card` | White rounded card with border (`rounded-2xl border border-zinc-200 bg-white shadow-sm`) |
| `.btn-primary` | Red primary button |
| `.btn-secondary` | Grey secondary button |
| `.btn-danger` | Red outlined danger button |
| `.badge` | Small inline pill |
| `.badge-yellow` | Pending / warning |
| `.badge-green` | Success / in stock |
| `.badge-red` | Error / out of stock |
| `.badge-blue` | Confirmed |
| `.badge-orange` | Out for delivery |
| `.input` | Styled text input |
| `.label` | Form field label |

### Typography

- Font: **Inter** (via Google Fonts or Nuxt font module)
- Headings: `font-black` or `font-bold`
- Body: regular weight, `text-zinc-700`
- Muted text: `text-zinc-400` / `text-zinc-500`

---

## 19. Running the Project

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or Neon)
- Cloudinary account
- Telegram bot (via @BotFather)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in all values in .env

# 3. Apply database migrations
npx prisma migrate deploy
# or for initial local setup:
npx prisma db push

# 4. Generate Prisma client
npx prisma generate

# 5. (Optional) Enable pg_trgm for fuzzy search
# Run in your PostgreSQL console or Neon SQL Editor:
# CREATE EXTENSION IF NOT EXISTS pg_trgm;

# 6. Start development server
npm run dev
```

### First Admin Account

Create an admin user directly via Prisma Studio or a seed script:

```bash
npx prisma studio
# or run a one-off script
```

Or use a seed file to create the first admin with a hashed password:

```js
import bcrypt from 'bcryptjs'
await prisma.user.create({
  data: {
    email: 'admin@example.com',
    passwordHash: await bcrypt.hash('your-password', 10),
    role: 'admin',
    name: 'Admin',
  },
})
```

---

## 20. Production Deployment

### Vercel (current setup)

The app is deployed to Vercel with a Neon PostgreSQL database.

**Important steps after deploying a schema change:**

```bash
# Apply migrations to production (Neon)
DATABASE_URL="your-neon-url" npx prisma migrate deploy
```

**pg_trgm extension** (required for the product search endpoint):

Run this once in the Neon SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Without it, `GET /api/products/search` returns a 500 error because the `similarity()` SQL function is unavailable.

### Environment Variables on Vercel

Set all variables from [Section 4](#4-environment-configuration) in the Vercel project settings under "Environment Variables".

### Build

```bash
npm run build    # outputs to .output/
npm run preview  # test production build locally
```

---

## 21. Known Limitations

| Area | Issue |
|------|-------|
| **Payment verification** | Telebirr/CBE/BOA reference code verification API not integrated — endpoint returns 503. Manual cashier review is the current flow. |
| **Delivery zones** | `DeliveryZone` model exists in schema but is not used in fee calculation (store coordinates + global settings are used instead). |
| **Real-time updates** | No WebSockets. Customer order page polls every 30 seconds; admin order list polls every 5 seconds. |
| **Search in production** | Requires `pg_trgm` extension enabled manually on Neon (see Section 20). |
| **CASH distance limit** | Hard-coded at 15 km. Not configurable via settings. |
| **Image optimization** | No automatic resizing beyond Cloudinary defaults. |
| **Admin permissions** | Fixed permission strings. No granular policy engine or UI for creating custom permission sets. |
