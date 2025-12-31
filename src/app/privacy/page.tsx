"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WorldMap from "@/components/ui/world-map";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <>
    <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy{" "}
              <span className="bg-black bg-clip-text text-transparent">
                Policy
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your privacy matters to us. This policy explains how we protect
              your data while providing you with the best tech shopping
              experience.
            </p>
          </div>

          {/* Privacy Policy Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Data Collection Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Data Collection
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We collect only essential information: your name, email,
                shipping address, and payment details. This helps us process
                your orders and provide customer support.
              </p>
            </div>

            {/* Data Security Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Data Security
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Your data is protected with industry-standard encryption. We use
                secure servers and never store your payment information on our
                systems.
              </p>
            </div>

            {/* Data Usage Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Data Usage
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We use your information solely to process orders, send order
                updates, and provide customer support. We never sell or share
                your data with third parties.
              </p>
            </div>

            {/* User Rights Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Your Rights
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                You have the right to access, update, or delete your personal
                information at any time. Contact us to exercise these rights or
                opt out of marketing communications.
              </p>
            </div>

            {/* Third Party Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Third Parties
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We only share data with trusted partners like payment processors
                and shipping companies to fulfill your orders. We never sell
                your information to advertisers or marketers.
              </p>
            </div>

            {/* Cookies Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Cookies
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We use essential cookies to remember your preferences and
                improve your shopping experience. You can control cookie
                settings in your browser preferences.
              </p>
            </div>
          </div>

          {/* Global Trust Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted{" "}
                <span className="bg-black bg-clip-text text-transparent">
                  Nationwide
                </span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our commitment to privacy and security has earned the trust of
                customers across multiple countries. We maintain the highest
                standards of data protection regardless of where you shop from.
              </p>
            </div>
          </div>


          {/* Contact Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Questions About Your Tech Privacy?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              If you have any questions about our privacy policy or how we
              handle your data while shopping for tech products, please
              don&apos;t hesitate to contact us. We&apos;re here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all">
                <Link href="/contact">Contact Us</Link>
              </button>
              <button
                className="border-2 border-black text-black dark:text-[#1E5CAF] dark:border-[#1E5CAF] px-8 py-3 rounded-xl font-semibold hover:bg-black hover:text-white dark:hover:bg-[#1E5CAF] transition-colors"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = "/home/privacy-policy.pdf";
                  link.download = "privacy-policy.pdf";
                  link.click();
                }}
              >
                Download Policy
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
