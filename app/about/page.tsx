import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'About Us | KM ITB Official Merchandise',
  description: 'Learn about KM ITB and our mission to provide premium merchandise for the ITB community.',
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <h1 className="text-4xl md:text-5xl font-light">About KM ITB</h1>
        <p className="text-gray-600 text-lg mt-4 max-w-2xl">
          We&apos;re dedicated to providing premium quality merchandise that celebrates the ITB community spirit.
        </p>
      </section>

      {/* Mission Section */}
      <section className="bg-gray-50 py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="space-y-3">
              <h2 className="text-2xl font-light">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                To create quality merchandise that brings the ITB community together and celebrates our shared values.
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-light">Our Quality</h2>
              <p className="text-gray-700 leading-relaxed">
                Every product is carefully selected and tested to ensure it meets our high standards for comfort and durability.
              </p>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-light">Our Community</h2>
              <p className="text-gray-700 leading-relaxed">
                We believe in the power of community. A portion of our proceeds supports student organizations at ITB.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="space-y-6 text-center">
          <h2 className="text-3xl md:text-4xl font-light">Join the Community</h2>
          <p className="text-gray-600 text-lg">
            Wear your pride with our exclusive KM ITB collection.
          </p>
          <Link href="/products">
            <Button className="rounded-full bg-accent hover:bg-accent text-black font-semibold px-8 py-6">
              Shop Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
