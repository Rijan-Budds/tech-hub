/* eslint-disable @typescript-eslint/no-explicit-any */

// /src/components/EsewaPAyment.tsx
"use client";
import { useState } from "react";
import Image from "next/image";

export default function EsewaPayment() {
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          amount: Number(formData.amount.toFixed(2)),
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment initiation failed');
      }

      const { paymentUrl, params } = await response.json();

      // Create hidden form for eSewa submission
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentUrl;
      form.style.display = 'none';

      // Add fields in required order
      const addField = (name: string, value: string) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      addField('amount', params.amount);
      addField('tax_amount', params.tax_amount);
      addField('total_amount', params.total_amount);
      addField('transaction_uuid', params.transaction_uuid);
      addField('product_code', params.product_code);
      addField('product_service_charge', params.product_service_charge);
      addField('product_delivery_charge', params.product_delivery_charge);
      addField('signed_field_names', params.signed_field_names);
      addField('signature', params.signature);
      addField('success_url', params.success_url);
      addField('failure_url', params.failure_url);

      document.body.appendChild(form);
      form.submit();

    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err.message || 'Payment initiation failed');
      setIsSubmitting(false);
    }
  };

  return (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full relative drop-shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Esewa Payment Form</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  name="name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Amount (NPR)
                </label>
                <input
                  type="number"
                  value={formData.amount || ""}
                  name="amount"
                  onChange={(e) => setFormData({
                    ...formData,
                    amount: Math.max(1, Number(e.target.value))
                  })}
                  className="w-full p-2 border rounded-md"
                  min="1"
                  step="0.01"
                  required
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-2 rounded-md flex items-center justify-center gap-2 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 cursor-pointer'
                  }`}
              >
                {isSubmitting ? (
                  'Processing...'
                ) : (
                  <>
                    Pay with
                    <Image
                      src="/images/esewa_logo.png"
                      alt="eSewa"
                      width={60}
                      height={20}
                      className="h-5 w-auto"
                    />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
  );
}