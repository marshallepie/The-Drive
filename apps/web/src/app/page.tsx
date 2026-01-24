import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white py-12 px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          Welcome to The Drive
        </h1>

        {/* Hero Image */}
        <div className="mb-12 rounded-lg overflow-hidden shadow-xl">
          <Image
            src="/drive-front-page-range.png"
            alt="Drive automotive marketplace"
            width={1200}
            height={600}
            className="w-full h-auto object-cover"
            priority
          />
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
