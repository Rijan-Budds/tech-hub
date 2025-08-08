'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'

interface CartItem {
  productId: string
  quantity: number
  product?: { id: string; name: string; price: number; image: string }
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:5000/cart', { credentials: 'include' })
        const data = await res.json()
        setItems(data.items || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const total = items.reduce((sum, it) => sum + (it.product ? it.product.price * it.quantity : 0), 0)

  const checkout = async () => {
    const res = await fetch('http://localhost:5000/orders/checkout', { method: 'POST', credentials: 'include' })
    const data = await res.json()
    if (!res.ok) return alert(data.message || 'Checkout failed')
    alert('Order placed!')
    setItems([])
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>

  if (items.length === 0) return <div className="max-w-4xl mx-auto px-4 py-8">Your cart is empty.</div>

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Your Cart</h1>
      <div className="space-y-4">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-4 border rounded p-4 bg-white dark:bg-gray-900 dark:text-white">
            {it.product && (
              <Image src={it.product.image} alt={it.product.name} width={96} height={96} className="w-24 h-24 object-cover rounded" />
            )}
            <div className="flex-1">
              <div className="font-semibold">{it.product?.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Qty: {it.quantity}</div>
            </div>
            <div className="text-orange-600 font-bold">
              {it.product ? `$${(it.product.price * it.quantity).toFixed(2)}` : ''}
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Total: ${total.toFixed(2)}</div>
        <button onClick={checkout} className="bg-[#f85606] text-white px-4 py-2 rounded hover:bg-[#e14e00]">Checkout</button>
      </div>
    </main>
  )
}