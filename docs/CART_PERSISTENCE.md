# Cart Persistence Integration (Phase 2C)

## Overview
Phase 2C replaces the mock UI state for the shopping cart with a persistent, PostgreSQL-backed cart system via Prisma. The cart is restricted to authenticated users only. Unauthenticated users are prompted to log in when attempting to add items to the cart or view the cart page.

## Architecture

1. **Database Schema**
   - `Cart`: Linked to a `User` (1:1 per active session).
   - `CartItem`: Linked to `Cart` and `ProductVariant`. Contains `quantity`.

2. **Repository Layer (`cart.repository.ts`)**
   - Centralizes Prisma database queries for carts.
   - Enforces business logic:
     - Minimum quantity of 1.
     - Maximum quantity equals available variant `stock`.
     - Rejects adding `ARCHIVED` or `DRAFT` products.

3. **Mapper Layer (`cart.mapper.ts`)**
   - Transforms deeply nested Prisma relational output into a flat `UICartItem` structure, preventing the UI from directly depending on the ORM shapes.

4. **Server Actions (`app/cart/actions.ts`)**
   - Secure server-side mutations for interacting with the cart.
   - `addToCartAction`
   - `updateCartQuantityAction`
   - `removeCartItemAction`
   - Each action requires `session?.user?.id` to authorize the mutation.

5. **Client Components**
   - `CartItemList`: Handles optimistic UI updates for quantity changes and item removal, dispatching Server Actions in the background.
   - `CheckoutClient`: Contains the state for delivery method and vouchers, receiving the initial DB-backed subtotal via props.

## Auth Behavior
- **`/cart`**: If the user is unauthenticated, the page renders a prompt to log in instead of the cart list. It does not redirect automatically to avoid jarring UX.
- **`Product Detail Add to Cart`**: The button calls `addToCartAction`. If unauthenticated, it receives an error and displays it beneath the button (e.g., "Please log in to add items to your cart").

## Limitations & Next Steps
- **Checkout is not implemented**: The `/checkout` page displays the accurate DB-backed cart summary, but clicking "Proceed to Checkout" only alerts that order creation is coming in the next phase.
- **No Guest Cart**: Currently, unauthenticated users cannot build a cart. Guest cart behavior with LocalStorage merging could be implemented as a future enhancement.
- **No Payments**: Midtrans integration is reserved for a future phase.

## Manual Testing Checklist
1. Visit a product detail page as a guest. Try to add to cart -> Expect "Please log in" message.
2. Log in. Add an item to cart -> Expect "Item added successfully".
3. Navigate to `/cart`. Verify the item is present with correct details and total.
4. Increase quantity -> Expect total to update and persist on refresh.
5. Try to increase quantity beyond stock -> Expect error alert.
6. Remove item -> Expect empty cart state.
7. Attempt to add a product that has `DRAFT` status (e.g. by guessing variant ID) -> Expect failure.
