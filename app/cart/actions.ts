'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { cartRepository } from '@/lib/repositories/cart.repository'
import { logAuditAction } from '@/lib/audit'

export async function addToCartAction(variantId: string, quantity: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Please log in to add items to your cart' }
    }

    if (!variantId || quantity < 1) {
      return { error: 'Invalid product variant or quantity' }
    }

    await cartRepository.addItemToCart(session.user.id, variantId, quantity)
    
    await logAuditAction({
      actorId: session.user.id,
      action: 'CART_ITEM_ADDED',
      entityType: 'Cart',
      entityId: session.user.id,
      metadata: { variantId, quantity }
    })
    
    revalidatePath('/cart')
    return { success: true }
  } catch (error: any) {
    console.error('Add to cart error:', error)
    return { error: error.message || 'Failed to add item to cart' }
  }
}

export async function updateCartQuantityAction(cartItemId: string, quantity: number) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    if (quantity < 1) {
      return { error: 'Quantity must be at least 1' }
    }

    await cartRepository.updateCartItemQuantity(session.user.id, cartItemId, quantity)
    
    await logAuditAction({
      actorId: session.user.id,
      action: 'CART_ITEM_UPDATED',
      entityType: 'CartItem',
      entityId: cartItemId,
      metadata: { newQuantity: quantity }
    })

    revalidatePath('/cart')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error('Update cart quantity error:', error)
    return { error: error.message || 'Failed to update quantity' }
  }
}

export async function removeCartItemAction(cartItemId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    await cartRepository.removeCartItem(session.user.id, cartItemId)
    
    await logAuditAction({
      actorId: session.user.id,
      action: 'CART_ITEM_REMOVED',
      entityType: 'CartItem',
      entityId: cartItemId
    })

    revalidatePath('/cart')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error('Remove cart item error:', error)
    return { error: error.message || 'Failed to remove item' }
  }
}

export async function clearCartAction() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Unauthorized' }
    }

    await cartRepository.clearCart(session.user.id)
    revalidatePath('/cart')
    revalidatePath('/checkout')
    return { success: true }
  } catch (error: any) {
    console.error('Clear cart error:', error)
    return { error: error.message || 'Failed to clear cart' }
  }
}
