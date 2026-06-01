import { prisma } from "@/lib/prisma"
import { ProductStatus, ProductCategory } from "@prisma/client"
import { UIProduct, UIProductVariant } from "@/lib/ui-types"
import { mapPrismaProductToUIProduct } from "@/lib/mappers/product.mapper"

export type CreateProductInput = {
  name: string
  slug: string
  description: string
  category: ProductCategory
  status: ProductStatus
  price: number // base price if no variants? We'll put it on the first variant if creating
  material?: string
  sizeChart?: string
  images: string[] // URLs
  variants: {
    sku: string
    name: string
    price: number
    stock: number
  }[]
}

export type UpdateProductInput = Partial<CreateProductInput>

export class AdminProductRepository {
  /**
   * Get all products including drafts and archived for admin view.
   */
  async getAllProducts(): Promise<UIProduct[]> {
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    return products.map(mapPrismaProductToUIProduct)
  }

  /**
   * Get a specific product by ID for admin edit.
   */
  async getAdminProductById(id: string): Promise<UIProduct | null> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        variants: true,
      },
    })
    if (!product) return null
    return mapPrismaProductToUIProduct(product)
  }

  /**
   * Create a new product with images and variants.
   */
  async createProduct(data: CreateProductInput): Promise<UIProduct> {
    const created = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        category: data.category,
        status: data.status,
        material: data.material || null,
        sizeChart: data.sizeChart || null,
        images: {
          create: data.images.map((url, i) => ({
            url,
            order: i,
            isPrimary: i === 0,
          })),
        },
        variants: {
          create: data.variants.map((v) => ({
            sku: v.sku,
            name: v.name,
            price: v.price,
            stock: v.stock,
          })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    })

    return mapPrismaProductToUIProduct(created)
  }

  /**
   * Update an existing product. Replaces variants and images entirely for simplicity in Phase 2B.
   */
  async updateProduct(id: string, data: UpdateProductInput): Promise<UIProduct> {
    // Start a transaction to safely overwrite variants and images if they were provided
    const updateData: any = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      category: data.category,
      status: data.status,
      material: data.material,
      sizeChart: data.sizeChart,
    }

    // Clean undefined fields
    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key])

    const transactions: any[] = []

    // If variants are provided, we delete old ones and create new ones
    if (data.variants) {
      transactions.push(prisma.productVariant.deleteMany({ where: { productId: id } }))
      updateData.variants = {
        create: data.variants.map((v) => ({
          sku: v.sku,
          name: v.name,
          price: v.price,
          stock: v.stock,
        })),
      }
    }

    // If images are provided, we delete old ones and create new ones
    if (data.images) {
      transactions.push(prisma.productImage.deleteMany({ where: { productId: id } }))
      updateData.images = {
        create: data.images.map((url, i) => ({
          url,
          order: i,
          isPrimary: i === 0,
        })),
      }
    }

    transactions.push(
      prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          images: true,
          variants: true,
        },
      })
    )

    // Execute in transaction
    const results = await prisma.$transaction(transactions)
    const updatedProduct = results[results.length - 1] // The last transaction is the update

    return mapPrismaProductToUIProduct(updatedProduct)
  }

  /**
   * Soft-delete a product by setting its status to ARCHIVED.
   */
  async archiveProduct(id: string): Promise<UIProduct> {
    const updated = await prisma.product.update({
      where: { id },
      data: { status: ProductStatus.ARCHIVED },
      include: {
        images: true,
        variants: true,
      },
    })
    return mapPrismaProductToUIProduct(updated)
  }

  /**
   * Publish a product by setting its status to PUBLISHED.
   */
  async publishProduct(id: string): Promise<UIProduct> {
    const updated = await prisma.product.update({
      where: { id },
      data: { status: ProductStatus.PUBLISHED },
      include: {
        images: true,
        variants: true,
      },
    })
    return mapPrismaProductToUIProduct(updated)
  }
}

export const adminProductRepository = new AdminProductRepository()
