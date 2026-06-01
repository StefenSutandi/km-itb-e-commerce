import { Product, ProductImage, ProductVariant } from "@prisma/client"
import { UIProduct, UIProductVariant } from "@/lib/ui-types"

type PrismaProductWithRelations = Product & {
  images?: ProductImage[]
  variants?: ProductVariant[]
}

/**
 * Maps a Prisma Product model to the UIProduct interface expected by frontend components.
 */
export function mapPrismaProductToUIProduct(product: PrismaProductWithRelations): UIProduct {
  // Sort images by 'order' or primary status if available
  const sortedImages = product.images 
    ? [...product.images].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.order - b.order;
      })
    : [];

  const imageUrls = sortedImages.length > 0 
    ? sortedImages.map(img => img.url) 
    : ['/images/placeholder.jpg'];

  // Determine base price from variants (minimum price)
  let basePrice = 0;
  if (product.variants && product.variants.length > 0) {
    basePrice = Math.min(...product.variants.map(v => Number(v.price)));
  }

  // Fallback to determine if featured (based on POP_UP_ONLY category or isLottery)
  const isFeatured = product.category === 'EVENT_POPUP' || product.isLottery;

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    slug: product.slug,
    category: product.category,
    price: basePrice,
    images: imageUrls,
    isFeatured: isFeatured,
    status: product.status,
    isActive: product.status === 'PUBLISHED' || product.status === 'READY_STOCK' || product.status === 'PRE_ORDER',
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    variants: product.variants ? product.variants.map(mapPrismaVariantToUIProductVariant) : [],
  }
}

/**
 * Maps a Prisma ProductVariant model to the UIProductVariant interface.
 */
export function mapPrismaVariantToUIProductVariant(variant: ProductVariant): UIProductVariant {
  // Map Prisma 'name' to UI size and color as a rough fallback if needed, 
  // but Prisma variant 'name' typically stores "S", "M" etc.
  
  // As a heuristic for the mock UI:
  let size = variant.name;
  let color = 'Default';

  // If the name is like "Red - M", split it
  if (variant.name.includes('-')) {
    const parts = variant.name.split('-').map(s => s.trim());
    if (parts.length >= 2) {
      color = parts[0];
      size = parts[1];
    }
  }

  return {
    id: variant.id,
    productId: variant.productId,
    name: variant.name,
    color: color,
    size: size,
    sku: variant.sku,
    stock: variant.stock,
    price: Number(variant.price),
    createdAt: variant.createdAt,
    updatedAt: variant.updatedAt,
    isActive: variant.stock > 0,
  }
}
