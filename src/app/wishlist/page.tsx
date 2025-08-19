'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

interface Product {
  id: string
  slug: string
  name: string
  price: number
  category: string
  image: string
}

export default function WishlistPage() {
  const [items, setItems] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/wishlist', { credentials: 'include' })
        const data = await res.json()
        setItems(data.items || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const removeItem = async (productId: string) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update wishlist')
      setItems((prev) => prev.filter((p) => p.id !== productId))
      toast.success('Removed from wishlist')
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update wishlist';
      toast.error(errorMessage);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0D3B66] mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading your wishlist...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">My Wishlist</h1>
      {items.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No items in wishlist.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Image src={p.image} alt={p.name} width={300} height={192} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <div className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{p.name}</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent mb-4">रु{p.price.toFixed(2)}</div>
                <button
                  onClick={() => removeItem(p.id)}
                  className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium"
                >
                  Remove from Wishlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
