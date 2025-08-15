"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Tabs } from "@/components/ui/tabs";

export default function ServicesPage() {
  const tabs = [
    {
      title: "Product Sourcing",
      value: "product-sourcing",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-6 text-base md:text-lg bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Product Sourcing</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-base md:text-lg leading-relaxed">
            Can&apos;t find a component? We&apos;ll source it from trusted distributors and manufacturers to get you exactly what you need.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Direct manufacturer partnerships
            </div>
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Quality assurance guarantee
            </div>
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Competitive pricing
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Build Assistance",
      value: "build-assistance",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-6 text-base md:text-lg bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Build Assistance</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-base md:text-lg leading-relaxed">
            Get expert help choosing compatible parts and professional assistance in assembling your dream PC setup.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Compatibility checking
            </div>
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Performance optimization
            </div>
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Professional assembly
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Warranty & Support",
      value: "warranty-support",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-6 text-base md:text-lg bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Warranty & Support</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-base md:text-lg leading-relaxed">
            Comprehensive guidance on manufacturer warranties and basic troubleshooting to keep your system running smoothly.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Warranty registration assistance
            </div>
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Technical support
            </div>
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Repair coordination
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Delivery",
      value: "delivery",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-6 text-base md:text-lg bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Delivery</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-base md:text-lg leading-relaxed">
            Doorstep delivery with transparent fees by city. We ensure your products reach you safely and on time.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Secure packaging
            </div>
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Real-time tracking
            </div> 
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              City-based pricing
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Service Hours",
      value: "service-hours",
      content: (
        <div className="w-full overflow-hidden relative h-full rounded-2xl p-6 text-base md:text-lg bg-white dark:bg-gray-800 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Service Hours</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-base md:text-lg leading-relaxed">
            We&apos;re here when you need us. Extended hours to accommodate your busy schedule.
          </p>
          <div className="space-y-3 mb-6">
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Sunday–Friday: 9:00 AM – 9:00 PM NPT
            </div>
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              Saturday: 10:00 AM – 6:00 PM NPT
            </div>
            <div className="flex items-center text-sm md:text-base text-gray-600 dark:text-gray-400">
              <div className="w-2 h-2 bg-[#0D3B66] dark:bg-[#1E5CAF] rounded-full mr-3" />
              24/7 online support
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Services</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We support you from purchase to setup and beyond. Our comprehensive services ensure you get the best experience.
            </p>
          </div>

          {/* Tabs Section with proper spacing */}
          <div className="h-[25rem] md:h-[30rem] [perspective:1000px] relative flex flex-col w-full items-start justify-start mb-16">
            <Tabs tabs={tabs} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
