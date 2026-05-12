import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">About KM</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Shop</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Apparel
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Customer</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-white transition-colors">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {currentYear} KM ITB Official Store. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              Facebook
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              Instagram
            </Link>
            <Link href="#" className="text-gray-400 hover:text-white transition-colors">
              Twitter
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
