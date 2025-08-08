'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

interface CartItem {
  productId: string
  quantity: number
  product?: { id: string; name: string; price: number; image: string }
}

interface CityFee { name: string; fee: number }

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState<CityFee[]>([])
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [country, setCountry] = useState('Nepal')
  const [city, setCity] = useState('Kathmandu')
  const [street, setStreet] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [cartRes, citiesRes] = await Promise.all([
          fetch('http://localhost:5000/cart', { credentials: 'include' }),
          fetch('http://localhost:5000/shipping/cities'),
        ])
        const cartData = await cartRes.json()
        const citiesData = await citiesRes.json()
        setItems(cartData.items || [])
        setCities(citiesData.cities || [])
        if ((citiesData.cities || []).length > 0) setCity(citiesData.cities[0].name)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + (it.product ? it.product.price * it.quantity : 0), 0),
    [items]
  )
  const deliveryFee = useMemo(
    () => cities.find((c) => c.name === city)?.fee ?? 5,
    [cities, city]
  )
  const grandTotal = subtotal + deliveryFee

  const checkout = async () => {
    if (!name || !email || !country || !city) {
      toast.error('Please fill all required fields')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('http://localhost:5000/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          address: { country, city, street },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Checkout failed')
      toast.success('Order placed!')
      setItems([])
    } catch (e: any) {
      toast.error(e.message || 'Checkout failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Your Cart</h1>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div>Your cart is empty.</div>
        ) : (
          items.map((it, idx) => (
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
          ))
        )}
      </div>

      {/* Checkout form */}
      <div className="border rounded p-4 bg-white dark:bg-gray-900 dark:text-white space-y-4">
        <h2 className="text-xl font-semibold">Shipping Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">Country</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800" />
          </div>
          <div>
            <label className="block text-sm mb-1">City</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800">
              {cities.map((c) => (
                <option key={c.name} value={c.name}>{c.name} (+${c.fee.toFixed(2)})</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Street Address</label>
            <input value={street} onChange={(e) => setStreet(e.target.value)} className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-white dark:bg-gray-800" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-6 pt-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">Subtotal: ${subtotal.toFixed(2)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Delivery: ${deliveryFee.toFixed(2)}</div>
          <div className="text-lg font-semibold">Total: ${grandTotal.toFixed(2)}</div>
          <button disabled={items.length === 0 || submitting} onClick={checkout} className="bg-[#f85606] text-white px-4 py-2 rounded hover:bg-[#e14e00] disabled:opacity-50">
            {submitting ? 'Placing...' : 'Checkout'}
          </button>
        </div>
      </div>
    </main>
  )
}