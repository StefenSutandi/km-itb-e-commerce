# KM ITB Official Merchandise Store

A modern, full-featured e-commerce platform for KM ITB official merchandise built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### Public Pages
- **Homepage** - Premium editorial design with hero section, featured products, and benefits overview
- **Product Catalog** - Responsive grid layout with all available merchandise
- **Product Detail** - Detailed view with variant selection, quantity control, and stock availability
- **Shopping Cart** - Complete cart management with quantity adjustment and removal
- **Checkout** - Multi-step checkout with delivery method selection and voucher application
- **Account Dashboard** - User profile and order history
- **Order Details** - Track individual orders with status and payment information

### Admin Dashboard
- **Dashboard Overview** - Key metrics (revenue, orders, pending items) with recent activity
- **Product Management** - CRUD operations for products with variant management
- **Order Management** - View and manage customer orders with status updates
- **Sales Reports** - Revenue analytics, top products, and order distribution charts
- **Order Details** - Admin view of orders with status update capabilities

### Architecture
- **Type-Safe** - Full TypeScript with comprehensive domain types
- **Service Layer** - Clean business logic separation with dependency injection
- **Mock Data** - Pre-populated with sample products, variants, orders, and vouchers
- **Responsive Design** - Mobile-first layout optimized for all screen sizes
- **Design System** - Premium black and white color scheme with mint accent colors

## Project Structure

```
app/
├── (root)
│   ├── page.tsx              # Homepage
│   ├── products/
│   │   ├── page.tsx          # Product catalog
│   │   └── [slug]/page.tsx   # Product detail
│   ├── cart/page.tsx         # Shopping cart
│   ├── checkout/page.tsx     # Checkout flow
│   ├── account/
│   │   ├── page.tsx          # Account dashboard
│   │   ├── orders/
│   │   │   ├── page.tsx      # Order history
│   │   │   └── [id]/page.tsx # Order detail
│   │   └── settings/page.tsx # Profile settings
│   ├── about/page.tsx        # About page
│   └── layout.tsx            # Root layout with nav/footer
│
├── admin/
│   ├── layout.tsx            # Admin layout with sidebar
│   ├── page.tsx              # Dashboard overview
│   ├── products/
│   │   ├── page.tsx          # Product management
│   │   ├── new/page.tsx      # Create product
│   │   └── [id]/page.tsx     # Edit product
│   ├── orders/
│   │   ├── page.tsx          # Order list
│   │   └── [id]/page.tsx     # Order detail
│   └── reports/page.tsx      # Sales reports
│
└── api/
    ├── orders/
    │   └── create/route.ts   # Order creation endpoint
    └── payments/
        └── midtrans/
            ├── create-transaction/route.ts
            └── webhook/route.ts

components/
├── navbar.tsx                # Navigation bar
├── footer.tsx                # Footer
├── product-card.tsx          # Product card component
├── product-grid.tsx          # Product grid with loading states
├── cart-summary.tsx          # Cart summary sidebar
├── order-status-badge.tsx    # Status badge components
└── admin-sidebar.tsx         # Admin navigation sidebar

lib/
├── types.ts                  # TypeScript domain types
├── format.ts                 # Formatting utilities (currency, dates, status)
├── mock-data.ts             # Mock data (products, variants, orders, vouchers)
├── services/
│   ├── order.service.ts     # Order business logic
│   └── payment.service.ts   # Payment processing logic
├── repositories/
│   └── mock.repository.ts   # In-memory data storage
└── config/
    └── payment.config.ts    # Payment configuration

styles/
└── globals.css              # Tailwind and design tokens
```

## Getting Started

### Prerequisites
- Node.js 18+ (or npm/yarn equivalent)
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Run development server
pnpm dev
```

The application will be available at `http://localhost:3000`

## Design System

### Colors
- **Primary**: Black (#000000) for dark cinematic marketing pages
- **Background**: White (#ffffff) for transactional pages
- **Accent**: Mint (#A8E6CF) - Primary action color
- **Accent Secondary**: Pistachio (#C7F0D8) - Secondary highlights
- **Neutrals**: Grays (various shades) for borders and text

### Typography
- **Heading Font**: Geist (light weight for modern aesthetic)
- **Body Font**: Geist (regular weight for readability)
- **Mono**: Geist Mono (for code and technical content)

### Component Styling
- All buttons use pill-shaped styling (`rounded-full`)
- Subtle borders on transactional pages
- Generous whitespace for premium feel
- Responsive breakpoints: md (768px), lg (1024px)

## Mock Data

The application comes pre-populated with:
- **8 Products**: KM ITB Premium Hoodie, KM ITB Classic T-Shirt, KM ITB Baseball Cap, Jaket Varsity KM ITB, Totebag KM ITB, Lanyard ITB, Sticker Pack Official, Notebook Official Merch
- **18 Variants**: Various colors and sizes with stock levels
- **2 Test Vouchers**: WELCOME10 (10% off), SAVE50K (Rp 50,000 off)
- **2 Sample Orders**: Demonstrating different order statuses

### Test Voucher Codes
- `WELCOME10` - 10% discount (min. Rp 100,000)
- `SAVE50K` - Rp 50,000 flat discount (min. Rp 200,000)

## API Routes

All API routes use mock repositories by default. Ready to be integrated with real backend:

### Order Creation
```
POST /api/orders/create
```
Creates a new order from cart items.

### Payment Transaction
```
POST /api/payments/midtrans/create-transaction
```
Initiates a payment transaction with Midtrans.

### Payment Webhook
```
POST /api/payments/midtrans/webhook
```
Handles payment status updates from Midtrans.

## Integration Points

### Future: Database Integration
Replace `MockRepository` in API routes with `DatabaseRepository` implementing the same interfaces.

### Future: Midtrans Payment Gateway
Environment variables are already configured for Midtrans integration. See `/docs/MIDTRANS_INTEGRATION_CHECKLIST.md`

### Future: Authentication
User management endpoints ready for auth service integration.

## Styling

The project uses Tailwind CSS 4+ with custom design tokens. Key tokens:

```css
--background: White
--foreground: Black
--accent: Mint (#A8E6CF)
--accent-secondary: Pistachio (#C7F0D8)
--border: Light Gray
--radius-full: 9999px (for pill buttons)
```

## Environment Variables

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
```

See `.env.example` for all available variables.

## Key Features Implementation

### Order Management
- Automatic tax calculation (10%)
- Flexible shipping options (Pickup/Delivery)
- Voucher/discount application
- Order number generation with timestamp

### Payment Processing
- Midtrans Snap integration ready
- Webhook handling for payment updates
- Order status transition management
- Support for multiple payment methods

### Admin Capabilities
- Real-time order management
- Product variant management
- Sales analytics and reporting
- Order status update with confirmation

## Performance Optimizations

- Server Components by default (only client where needed)
- Image optimization through Next.js Image component
- Responsive images for different screen sizes
- Lazy loading for product images
- Minimal JavaScript bundle

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Real database integration (PostgreSQL/Supabase)
- [ ] User authentication and registration
- [ ] Midtrans payment gateway integration
- [ ] Email notifications
- [ ] Inventory management
- [ ] Customer reviews and ratings
- [ ] Wishlist functionality
- [ ] Advanced search and filtering
- [ ] Multi-language support (Indonesian/English)
- [ ] Mobile app version

## Contributing

This is an internal project for KM ITB. For changes or issues, please contact the development team.

## License

Proprietary - KM ITB Official Store

## Support

For issues or questions, refer to:
1. `/docs/PAYMENT_IMPLEMENTATION.md` - Payment integration guide
2. `/docs/MIDTRANS_INTEGRATION_CHECKLIST.md` - Step-by-step integration
3. `/lib/types.ts` - Type definitions and data structures

---

**Last Updated**: May 12, 2026
**Status**: MVP Complete - Ready for Feature Development
