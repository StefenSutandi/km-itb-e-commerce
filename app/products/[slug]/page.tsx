import { productRepository, isMockFallbackAllowed } from '@/lib/repositories/product.repository'
import { notFound } from 'next/navigation'
import { ProductDetailClient } from './product-detail-client'
import { Metadata } from 'next'
import { mockProducts } from '@/lib/mock-data'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let product = await productRepository.getProductBySlug(params.slug)
  
  if (!product && isMockFallbackAllowed()) {
    product = mockProducts.find(p => p.slug === params.slug) || null
  }

  if (!product) {
    return {
      title: 'Product Not Found | KM ITB',
    }
  }

  return {
    title: `${product.name} | KM ITB Merchandise`,
    description: product.description.substring(0, 160),
  }
}

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  let product = await productRepository.getProductBySlug(params.slug)

  if (!product && isMockFallbackAllowed()) {
    product = mockProducts.find(p => p.slug === params.slug) || null
  }

  if (!product) {
    notFound()
  }

  return <ProductDetailClient product={product} />
}
