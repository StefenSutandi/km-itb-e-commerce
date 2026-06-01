import { prisma } from "@/lib/prisma"
import { ProductStatus } from "@prisma/client"
import { UICart } from "@/lib/ui-types"
import { mapPrismaCartToUICart } from "@/lib/mappers/cart.mapper"

export class CartRepository {
  /**
   * Retrieves the cart for a user.
   */
  async getCartByUserId(userId: string): Promise<UICart | null> {
    const cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!cart) return null

    return mapPrismaCartToUICart(cart)
  }

  /**
   * Gets or creates a cart for a user.
   */
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findFirst({ where: { userId } })
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } })
    }
    return cart
  }

  /**
   * Adds an item to the user's cart. 
   * If the variant already exists in the cart, it increments the quantity.
   */
  async addItemToCart(userId: string, variantId: string, quantity: number) {
    if (quantity < 1) throw new Error("Quantity must be at least 1")

    // Check variant existence, stock, and product status
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true }
    })

    if (!variant) throw new Error("Product variant not found")
    if (variant.stock < 1) throw new Error("Product variant is out of stock")
    if (variant.product.status === ProductStatus.ARCHIVED || variant.product.status === ProductStatus.DRAFT) {
      throw new Error("Product is not available for purchase")
    }

    const cart = await this.getOrCreateCart(userId)

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId
        }
      }
    })

    let newQuantity = quantity
    if (existingItem) {
      newQuantity += existingItem.quantity
    }

    if (newQuantity > variant.stock) {
      throw new Error(`Cannot add more than available stock (${variant.stock})`)
    }

    if (existingItem) {
      return prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity }
      })
    } else {
      return prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity: newQuantity
        }
      })
    }
  }

  /**
   * Updates the quantity of a specific cart item.
   */
  async updateCartItemQuantity(userId: string, cartItemId: string, quantity: number) {
    if (quantity < 1) throw new Error("Quantity must be at least 1")

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        variant: true
      }
    })

    if (!cartItem) throw new Error("Cart item not found")
    if (cartItem.cart.userId !== userId) throw new Error("Unauthorized")

    if (quantity > cartItem.variant.stock) {
      throw new Error(`Cannot exceed available stock (${cartItem.variant.stock})`)
    }

    return prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    })
  }

  /**
   * Removes an item from the cart.
   */
  async removeCartItem(userId: string, cartItemId: string) {
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true }
    })

    if (!cartItem) return // Already removed or doesn't exist
    if (cartItem.cart.userId !== userId) throw new Error("Unauthorized")

    return prisma.cartItem.delete({
      where: { id: cartItemId }
    })
  }

  /**
   * Clears all items from the user's cart.
   */
  async clearCart(userId: string) {
    const cart = await prisma.cart.findFirst({ where: { userId } })
    if (!cart) return

    return prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })
  }

  /**
   * Calculates the summary totals for the user's cart.
   */
  async calculateCartSummary(userId: string) {
    const cart = await this.getCartByUserId(userId)
    if (!cart || cart.items.length === 0) {
      return { subtotal: 0, tax: 0, shipping: 0, total: 0 }
    }

    const subtotal = cart.items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0)
    const tax = Math.round(subtotal * 0.1) // 10% tax mock
    const shipping = 50000 // Flat shipping mock
    const total = subtotal + tax + shipping

    return { subtotal, tax, shipping, total }
  }
}

export const cartRepository = new CartRepository()
