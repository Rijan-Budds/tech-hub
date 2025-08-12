import React from "react";

export default function AboutPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">About Tech Store</h1>
        <p className="text-gray-600 dark:text-gray-300">
          We are a modern e‑commerce store focused on quality computer parts and
          accessories. Our goal is to make tech shopping simple, transparent, and fast.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-8">
        <div className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white">
          <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300">
            To deliver reliable tech products at fair prices with exceptional customer
            service and quick delivery across Nepal.
          </p>
        </div>
        <div className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white">
          <h2 className="text-xl font-semibold mb-2">Our Values</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
            <li>Quality products from trusted brands</li>
            <li>Honest pricing and clear information</li>
            <li>Fast, careful shipping</li>
            <li>Friendly, responsive support</li>
          </ul>
        </div>
      </section>

      <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Products", value: "500+" },
          { label: "Happy Customers", value: "10k+" },
          { label: "Cities Served", value: "25+" },
          { label: "Support Hrs/day", value: "12" },
        ].map((s) => (
          <div
            key={s.label}
            className="p-6 rounded border text-center bg-white dark:bg-gray-900 dark:text-white"
          >
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-gray-600 dark:text-gray-300">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white">
        <h2 className="text-xl font-semibold mb-2">Why shop with us?</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
          <li>Carefully curated parts and accessories</li>
          <li>Secure payments and safe checkout</li>
          <li>Warranty support on eligible items</li>
          <li>Helpful guides and quick responses</li>
        </ul>
      </section>
    </main>
  );
}