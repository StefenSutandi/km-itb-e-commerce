'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { UIProduct, UIProductVariant } from '@/lib/ui-types'
import { createProductAction, updateProductAction } from '@/app/admin/products/actions'

interface ProductFormProps {
  initialData?: UIProduct | null
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    category: initialData?.category || 'KM_ITB',
    status: initialData?.status || 'DRAFT',
    price: initialData?.price?.toString() || '0',
    images: initialData?.images?.join(', ') || '',
  })

  // Map variants, taking care to extract price as string for input
  const [variants, setVariants] = useState<any[]>(
    initialData?.variants?.map(v => ({
      sku: v.sku,
      name: v.name || v.size || 'Default',
      price: v.price?.toString() || formData.price,
      stock: v.stock.toString()
    })) || [
      { sku: `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, name: 'Default', price: '0', stock: '0' }
    ]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleVariantChange = (index: number, field: string, value: string) => {
    const newVariants = [...variants]
    newVariants[index][field] = value
    setVariants(newVariants)
  }

  const addVariant = () => {
    setVariants([...variants, { sku: `SKU-${Math.random().toString(36).substr(2, 5).toUpperCase()}`, name: '', price: formData.price, stock: '0' }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      images: formData.images.split(',').map(s => s.trim()).filter(Boolean),
      variants: variants.map(v => ({
        ...v,
        price: parseFloat(v.price),
        stock: parseInt(v.stock, 10) || 0
      }))
    }

    // Default image if empty
    if (payload.images.length === 0) {
      payload.images = ['/images/placeholder.jpg']
    }

    try {
      let result;
      if (initialData?.id) {
        result = await updateProductAction(initialData.id, payload)
      } else {
        result = await createProductAction(payload)
      }

      if (result.error) {
        setError(result.error)
      } else {
        router.push('/admin/products')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="p-6 border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Base Price (IDR) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category *</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              >
                <option value="OFFICIAL_ITB">Official ITB</option>
                <option value="KM_ITB">KM ITB</option>
                <option value="EVENT_POPUP">Event / Pop-up</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Status *</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="PRE_ORDER">Pre-Order</option>
                <option value="READY_STOCK">Ready Stock</option>
                <option value="SOLD_OUT">Sold Out</option>
                <option value="POP_UP_ONLY">Pop-up Only</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Images (Comma separated URLs)</h2>
          <p className="text-sm text-gray-500">Real file upload will be implemented in a later phase.</p>
          <input
            type="text"
            name="images"
            value={formData.images}
            onChange={handleChange}
            placeholder="/images/product-1.jpg, https://example.com/img.png"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Variants */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Variants</h2>
              <p className="text-sm text-gray-600">Add product variations like size/color.</p>
            </div>
            <Button type="button" onClick={addVariant} variant="outline" className="rounded-full">
              Add Variant
            </Button>
          </div>
          
          <div className="space-y-4">
            {variants.map((variant, idx) => (
              <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium mb-1">SKU</label>
                  <input
                    type="text"
                    value={variant.sku}
                    onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-medium mb-1">Name/Size</label>
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="block text-xs font-medium mb-1">Price</label>
                  <input
                    type="number"
                    value={variant.price}
                    onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div className="flex-1 min-w-[80px]">
                  <label className="block text-xs font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => handleVariantChange(idx, 'stock', e.target.value)}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <Button 
                  type="button" 
                  onClick={() => removeVariant(idx)}
                  variant="ghost" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={variants.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-6 border-t border-gray-200">
          <Button type="button" onClick={() => router.push('/admin/products')} variant="outline" className="flex-1 rounded-full">
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="flex-1 rounded-full bg-black hover:bg-gray-900 text-white">
            {loading ? 'Saving...' : (initialData ? 'Update Product' : 'Create Product')}
          </Button>
        </div>
      </form>
    </Card>
  )
}
