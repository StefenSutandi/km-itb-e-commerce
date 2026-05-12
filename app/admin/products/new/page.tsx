import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-light">Add New Product</h1>

      <Card className="p-6 border-gray-200">
        <form className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium mb-2">Product Name</label>
              <input
                type="text"
                placeholder="e.g., Premium Hoodie"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                rows={4}
                placeholder="Product description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Price (IDR)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black">
                  <option>APPAREL</option>
                  <option>ACCESSORIES</option>
                </select>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Images</h2>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-600">Drag and drop images here or click to select</p>
            </div>
          </div>

          {/* Variants */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Variants</h2>
            <p className="text-sm text-gray-600">Add product variations like color and size</p>
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
              Create Product
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
