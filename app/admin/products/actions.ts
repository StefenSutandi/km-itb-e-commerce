'use server'

import { revalidatePath } from 'next/cache'
import { adminProductRepository } from '@/lib/repositories/admin-product.repository'
import { ProductCategory, ProductStatus } from '@prisma/client'
import { logAuditAction } from '@/lib/audit'
import { auth } from '@/auth' // Assuming auth is available or we use a fallback

// Type check for the incoming action data
export async function createProductAction(data: any) {
  try {
    const session = await auth()
    const adminId = session?.user?.id || 'system-admin'

    // Validate simple required fields manually since Zod isn't explicitly requested to be installed if missing
    if (!data.name || !data.slug || !data.category || !data.status) {
      return { error: 'Missing required fields' }
    }

    if (!data.variants || data.variants.length === 0) {
      return { error: 'At least one variant is required' }
    }

    const created = await adminProductRepository.createProduct(data)
    await logAuditAction({
      actorId: adminId, 
      action: 'PRODUCT_CREATED', 
      entityType: 'Product', 
      entityId: created.id, 
      metadata: { slug: created.slug }
    })
    revalidatePath('/admin/products')
    revalidatePath('/products')
    
    return { success: true, product: created }
  } catch (error: any) {
    console.error('Create product failed:', error)
    return { error: error.message || 'Failed to create product' }
  }
}

export async function updateProductAction(id: string, data: any) {
  try {
    const session = await auth()
    const adminId = session?.user?.id || 'system-admin'

    const updated = await adminProductRepository.updateProduct(id, data)
    await logAuditAction({
      actorId: adminId, 
      action: 'PRODUCT_UPDATED', 
      entityType: 'Product', 
      entityId: updated.id, 
      metadata: { status: updated.status }
    })
    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath(`/products/${updated.slug}`)
    
    return { success: true, product: updated }
  } catch (error: any) {
    console.error('Update product failed:', error)
    return { error: error.message || 'Failed to update product' }
  }
}

export async function archiveProductAction(id: string) {
  try {
    const session = await auth()
    const adminId = session?.user?.id || 'system-admin'

    const archived = await adminProductRepository.archiveProduct(id)
    await logAuditAction({
      actorId: adminId, 
      action: 'PRODUCT_ARCHIVED', 
      entityType: 'Product', 
      entityId: archived.id
    })
    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath(`/products/${archived.slug}`)
    
    return { success: true }
  } catch (error: any) {
    console.error('Archive product failed:', error)
    return { error: error.message || 'Failed to archive product' }
  }
}

export async function publishProductAction(id: string) {
  try {
    const session = await auth()
    const adminId = session?.user?.id || 'system-admin'

    const published = await adminProductRepository.publishProduct(id)
    await logAuditAction({
      actorId: adminId, 
      action: 'PRODUCT_PUBLISHED', 
      entityType: 'Product', 
      entityId: published.id
    })
    revalidatePath('/admin/products')
    revalidatePath('/products')
    revalidatePath(`/products/${published.slug}`)
    
    return { success: true }
  } catch (error: any) {
    console.error('Publish product failed:', error)
    return { error: error.message || 'Failed to publish product' }
  }
}
