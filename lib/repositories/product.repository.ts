import { prisma } from "@/lib/prisma"
import { ProductCategory, ProductStatus } from "@prisma/client"
import { mapPrismaProductToUIProduct } from "@/lib/mappers/product.mapper"
import { UIProduct } from "@/lib/ui-types"

/**
 * Determines if falling back to mock data is permitted.
 * Safe for local development/demo but disabled in production.
 */
export function isMockFallbackAllowed(): boolean {
  if (process.env.NODE_ENV === "production") {
    // In production, we MUST read explicitly from env var if they forcefully enabled it,
    // but typically it's false. If not present, default to false.
    return process.env.ENABLE_MOCK_FALLBACK === "true"
  }
  // In development, default to true unless explicitly disabled
  return process.env.ENABLE_MOCK_FALLBACK !== "false"
}

export class ProductRepository {
  /**
   * Get all published products, optionally filtered by category or search query.
   */
  async getPublishedProducts(category?: string, query?: string): Promise<UIProduct[]> {
    try {
      const whereClause: any = {
        status: {
          in: [ProductStatus.PUBLISHED, ProductStatus.READY_STOCK, ProductStatus.PRE_ORDER, ProductStatus.POP_UP_ONLY]
        }
      }

      if (category && category !== 'ALL') {
        whereClause.category = category as ProductCategory
      }

      if (query) {
        whereClause.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ]
      }

      const products = await prisma.product.findMany({
        where: whereClause,
        include: {
          images: true,
          variants: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return products.map(mapPrismaProductToUIProduct)
    } catch (error) {
      console.error("[ProductRepository] getPublishedProducts error:", error)
      return [] // Safe fallback for build time or DB failure
    }
  }

  /**
   * Get a single product by its slug
   */
  async getProductBySlug(slug: string): Promise<UIProduct | null> {
    try {
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          images: true,
          variants: true,
        },
      })

      if (!product) return null

      // Don't leak drafts or archived products to the frontend
      if (product.status === ProductStatus.DRAFT || product.status === ProductStatus.ARCHIVED) {
        return null
      }

      return mapPrismaProductToUIProduct(product)
    } catch (error) {
      console.error("[ProductRepository] getProductBySlug error:", error)
      return null
    }
  }

  /**
   * Get featured products (e.g., for homepage)
   */
  async getFeaturedProducts(limit: number = 4): Promise<UIProduct[]> {
    try {
      // First try to find products that are EVENT_POPUP or isLottery
      const products = await prisma.product.findMany({
        where: {
          status: {
            in: [ProductStatus.PUBLISHED, ProductStatus.READY_STOCK, ProductStatus.PRE_ORDER]
          }
        },
        include: {
          images: true,
          variants: true,
        },
        take: limit,
        orderBy: {
          createdAt: 'desc' // Just take newest as featured for now
        }
      })

      return products.map(mapPrismaProductToUIProduct)
    } catch (error) {
      console.error("[ProductRepository] getFeaturedProducts error:", error)
      return []
    }
  }
}

// Export a singleton instance
export const productRepository = new ProductRepository()
