"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { ModeToggle } from '@/components/ui/mode-toggle'

const trendingProducts = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: "$59.99",
    slug: "wireless-headphones",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Smart Watch",
    price: "$129.99",
    slug: "smart-watch",
    image: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Gaming Mouse",
    price: "$39.99",
    slug: "gaming-mouse",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Bluetooth Speaker",
    price: "$49.99",
    slug: "bluetooth-speaker",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
  }
]

const featuredCategories = [
  { id: 1, name: "Electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
  { id: 2, name: "Clothing", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
  { id: 3, name: "Home & Kitchen", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80" },
]

const deals = [
  {
    id: 1,
    title: "50% off on all headphones!",
    description: "Limited time offer on select wireless headphones.",
  },
  {
    id: 2,
    title: "Buy 1 Get 1 Free: T-Shirts",
    description: "Exclusive deal on all t-shirt brands.",
  },
]

function Page() {
  return (
    <>
      <Header />

      {/* Theme toggle button */}
      <div className="flex justify-end px-4 mt-4">
        <ModeToggle />
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12 bg-white dark:bg-black transition-colors">

        {/* Trending Products */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Trending Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map(product => (
              <Link key={product.id} href={`/product/${product.slug}`}>
                <div className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-900 dark:text-white">
                  <Image src={product.image} alt={product.name} width={300} height={192} className="w-full h-48 object-cover mb-4 rounded" />
                  <h3 className="font-semibold text-lg">{product.name}</h3>
                  <p className="text-orange-600 font-bold">{product.price}</p>
                  <button className="mt-3 w-full bg-[#f85606] text-white py-2 rounded hover:bg-[#e14e00] transition">View Details</button>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Categories */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Featured Categories</h2>
          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            {featuredCategories.map(cat => (
              <div key={cat.id} className="relative rounded overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-md w-[300px]">
                <Image src={cat.image} alt={cat.name} width={300} height={160} className="w-full h-40 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-2 font-semibold">
                  {cat.name}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Deals Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Deals & Offers</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            {deals.map(deal => (
              <div key={deal.id} className="border-l-4 border-[#f85606] bg-orange-50 dark:bg-orange-900 dark:text-white p-4 rounded shadow-sm">
                <h3 className="font-semibold text-lg">{deal.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{deal.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default Page
