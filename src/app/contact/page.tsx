"use client";
import React, { useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Have a question about a product or an order? We’re here to help.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6 rounded border bg-white dark:bg-gray-900 dark:text-white"
        >
          <div>
            <label className="block mb-1">Name</label>
            <input
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1">Message</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-32 bg-white dark:bg-gray-800"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
          >
            Send Message
          </button>
          {sent && (
            <p className="text-green-600 mt-2">Thanks! We’ll get back to you soon.</p>
          )}
        </form>

        <div className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white space-y-2">
          <h2 className="text-xl font-semibold mb-2">Support</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Email: support@techstore.example
          </p>
          <p className="text-gray-600 dark:text-gray-300">Phone: +977-9800000000</p>
          <p className="text-gray-600 dark:text-gray-300">Hours: Sun–Fri, 9am–9pm</p>
        </div>
      </section>
    </main>
  );
}