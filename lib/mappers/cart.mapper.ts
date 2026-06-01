import { UICart, UICartItem } from '@/lib/ui-types'

export function mapPrismaCartToUICart(prismaCart: any): UICart {
  return {
    userId: prismaCart.userId,
    items: prismaCart.items.map(mapPrismaCartItemToUICartItem),
    createdAt: prismaCart.createdAt,
    updatedAt: prismaCart.updatedAt,
  }
}

export function mapPrismaCartItemToUICartItem(prismaCartItem: any): UICartItem {
  const variant = prismaCartItem.variant
  const product = variant?.product
  
  // Try to get primary image, or fallback to first image, or placeholder
  let imageUrl = '/images/placeholder.jpg'
  if (product?.images && product.images.length > 0) {
    const primary = product.images.find((img: any) => img.isPrimary)
    imageUrl = primary ? primary.url : product.images[0].url
  }

  return {
    id: prismaCartItem.id,
    productId: variant?.productId || '',
    variantId: prismaCartItem.variantId,
    quantity: prismaCartItem.quantity,
    addedAt: new Date(), // CartItem doesn't have createdAt
    
    productName: product?.name || 'Unknown Product',
    variantName: variant?.name || 'Unknown Variant',
    price: variant?.price ? Number(variant.price) : 0,
    image: imageUrl,
  }
}
