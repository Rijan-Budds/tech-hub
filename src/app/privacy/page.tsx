"use client";

import React from "react";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { StickyScroll } from "@/components/ui/sticky-scroll-reveal";
import Link from "next/link";

export default function PrivacyPage() {
  const content = [
    {
      title: "Information We Collect",
      description:
        "Account details, order information, shipping addresses, and browsing data to provide you with the best tech shopping experience.",
      content: (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl">
          <div className="text-center p-6">
            <h3 className="text-2xl font-bold mb-2">Information We Collect</h3>
            <p className="text-sm opacity-90">Essential data for seamless tech shopping</p>
          </div>
        </div>
      ),
    },
    {
      title: "How We Use Information",
      description:
        "We use your information to process orders, provide technical support, recommend compatible parts, and improve our tech services.",
      content: (
        <div className="flex h-full w-full items-center justify-center text-white rounded-xl overflow-hidden">
          <Image
            src="/home/slider1.jpg"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            alt="Privacy usage demo"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0D3B66]/80 to-[#1E5CAF]/80 flex items-center justify-center">
            <div className="text-center p-6">
              <h3 className="text-2xl font-bold mb-2">How We Use Information</h3>
              <p className="text-sm opacity-90">Processing orders & tech support</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Cookies & Session Data",
      description:
        "We use cookies for shopping cart functionality, user authentication, and to remember your tech preferences and build configurations.",
      content: (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl">
          <div className="text-center p-6">
            <h3 className="text-2xl font-bold mb-2">Cookies & Session Data</h3>
            <p className="text-sm opacity-90">Shopping cart & build preferences</p>
          </div>
        </div>
      ),
    },
    {
      title: "Data Sharing",
      description:
        "We do not sell your personal data. We share limited info with payment processors and delivery partners to fulfill your tech orders securely.",
      content: (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl">
          <div className="text-center p-6">
            <h3 className="text-2xl font-bold mb-2">Data Sharing</h3>
            <p className="text-sm opacity-90">Secure & limited sharing only</p>
          </div>
        </div>
      ),
    },
    {
      title: "Your Tech Privacy Rights",
      description:
        "You can update account details, request data deletion, opt out of marketing, and access your order history and build configurations.",
      content: (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0D3B66] to-[#1E5CAF] text-white rounded-xl">
          <div className="text-center p-6">
            <h3 className="text-2xl font-bold mb-2">Your Tech Privacy Rights</h3>
            <p className="text-sm opacity-90">Control your data & preferences</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Policy</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your privacy matters to us. This policy explains how we protect your data while providing you with the best tech shopping experience.
            </p>
          </div>

          {/* Sticky Scroll Reveal with proper styling */}
          <div className="w-full py-4 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <StickyScroll content={content} />
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Questions About Your Tech Privacy?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              If you have any questions about our privacy policy or how we handle your data while shopping for tech products, 
              please don&apos;t hesitate to contact us. We&apos;re here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] text-white px-8 py-3 rounded-xl font-semibold hover:from-[#0D3B66]/90 hover:to-[#1E5CAF]/90 transition-all">
                <Link href="/contact">Contact Us</Link>
              </button>
              <button className="border-2 border-[#0D3B66] text-[#0D3B66] dark:text-[#1E5CAF] dark:border-[#1E5CAF] px-8 py-3 rounded-xl font-semibold hover:bg-[#0D3B66] hover:text-white dark:hover:bg-[#1E5CAF] transition-colors" onClick={() => {
                const link = document.createElement("a");
                link.href = "/home/privacy-policy.pdf";
                link.download = "privacy-policy.pdf";
                link.click();
              }}>
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
