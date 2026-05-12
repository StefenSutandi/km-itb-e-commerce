import { mockProducts, mockVariants } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function EditProductPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find((p) => p.id === params.id)
  const productVariants = mockVariants.filter((v) => v.productId === params.id)

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-light">Edit Product</h1>

      <Card className="p-6 border-gray-200">
        <form className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                defaultValue={product.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                rows={4}
                defaultValue={product.description}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (IDR)</label>
                <input
                  type="number"
                  defaultValue={product.price}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  defaultValue={product.status}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option>ACTIVE</option>
                  <option>INACTIVE</option>
                </select>
              </div>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Variants</h2>
            <div className="space-y-3">
              {productVariants.map((variant) => (
                <Card key={variant.id} className="p-4 border-gray-200">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Color</p>
                      <p className="font-medium">{variant.color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Size</p>
                      <p className="font-medium">{variant.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Stock</p>
                      <p className="font-medium">{variant.stock}</p>
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="ghost" size="sm" className="text-red-600">
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button type="button" variant="outline" className="rounded-full">
              Add Variant
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6">
            <Button type="button" variant="outline" className="flex-1 rounded-full">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 rounded-full bg-black hover:bg-gray-900 text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
