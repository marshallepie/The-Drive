import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Image - different images for mobile vs desktop */}
        <div className="mb-8 overflow-hidden shadow-xl">
          {/* Mobile Image */}
          <div className="block md:hidden">
            <Image
              src="/drive-range.png"
              alt="Drive automotive marketplace"
              width={800}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
          {/* Desktop Image */}
          <div className="hidden md:block rounded-lg overflow-hidden">
            <Image
              src="/drive-front-page-range.png"
              alt="Drive automotive marketplace"
              width={1200}
              height={600}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>

        {/* Mobile Tagline */}
        <div className="block md:hidden mb-12 text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            The Web 3 Marketplace And Vault For Collector Cars
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
            <h2 className="text-2xl font-semibold mb-2 text-white">Browse Vehicles</h2>
            <p className="text-gray-300">
              Discover thousands of vehicles from dealers and private sellers
            </p>
          </div>

          <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
            <h2 className="text-2xl font-semibold mb-2 text-white">Secure Payments</h2>
            <p className="text-gray-300">
              Pay with traditional methods or cryptocurrency via smart contract escrow
            </p>
          </div>

          <div className="p-6 border border-gray-700 rounded-lg bg-gray-900">
            <h2 className="text-2xl font-semibold mb-2 text-white">Finance Options</h2>
            <p className="text-gray-300">
              Apply for financing directly through our platform
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
