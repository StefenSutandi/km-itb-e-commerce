import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="space-y-8">
          <h1 className="text-4xl font-light">Profile Settings</h1>

          {/* Basic Info */}
          <Card className="p-6 space-y-4 border-gray-200">
            <h2 className="text-xl font-semibold">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="Budi Santoso"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="budi@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="08123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <Button className="rounded-full bg-black hover:bg-gray-900 text-white">
              Save Changes
            </Button>
          </Card>

          {/* Password */}
          <Card className="p-6 space-y-4 border-gray-200">
            <h2 className="text-xl font-semibold">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <Button className="rounded-full bg-black hover:bg-gray-900 text-white">
              Update Password
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
