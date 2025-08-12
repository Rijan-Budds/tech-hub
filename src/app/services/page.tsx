import React from "react";
import Footer from "@/components/layout/Footer";

export default function ServicesPage() {
  return (
    <>
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Our Services</h1>
        <p className="text-gray-600 dark:text-gray-300">
          We support you from purchase to setup and beyond.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white">
          <h2 className="text-xl font-semibold mb-2">Product Sourcing</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Can’t find a component? We’ll source it from trusted distributors.
          </p>
        </div>
        <div className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white">
          <h2 className="text-xl font-semibold mb-2">Build Assistance</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Help choosing compatible parts and assembling your PC.
          </p>
        </div>
        <div className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white">
          <h2 className="text-xl font-semibold mb-2">Warranty & Support</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Guidance on manufacturer warranties and basic troubleshooting.
          </p>
        </div>
        <div className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white">
          <h2 className="text-xl font-semibold mb-2">Delivery</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Doorstep delivery with transparent fees by city.
          </p>
        </div>
      </section>

      <section className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white">
        <h2 className="text-xl font-semibold mb-2">Service Hours</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Sunday–Friday, 9:00 AM – 9:00 PM NPT
        </p>
      </section>
    </main>
    <Footer />
    </>
  );
}