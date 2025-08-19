"use client";

import React from "react";
import Image from "next/image";
import Footer from "@/components/layout/Footer";
import WorldMap from "@/components/ui/world-map";
import Link from "next/link";
import { FaShieldAlt, FaUserLock, FaDatabase, FaEye, FaHandshake, FaGlobe, FaCog, FaBell } from "react-icons/fa";

export default function PrivacyPage() {

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

          {/* Privacy Policy Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {/* Data Collection Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl mr-4">
                  <FaDatabase className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Data Collection</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We collect only essential information: your name, email, shipping address, and payment details. 
                This helps us process your orders and provide customer support.
              </p>
            </div>

            {/* Data Security Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl mr-4">
                  <FaShieldAlt className="text-green-600 dark:text-green-400 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Data Security</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Your data is protected with industry-standard encryption. We use secure servers and 
                never store your payment information on our systems.
              </p>
            </div>

            {/* Data Usage Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl mr-4">
                  <FaEye className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Data Usage</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We use your information solely to process orders, send order updates, and provide 
                customer support. We never sell or share your data with third parties.
              </p>
            </div>

            {/* User Rights Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl mr-4">
                  <FaUserLock className="text-orange-600 dark:text-orange-400 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Rights</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                You have the right to access, update, or delete your personal information at any time. 
                Contact us to exercise these rights or opt out of marketing communications.
              </p>
            </div>

            {/* Third Party Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-xl mr-4">
                  <FaHandshake className="text-red-600 dark:text-red-400 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Third Parties</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We only share data with trusted partners like payment processors and shipping companies 
                to fulfill your orders. We never sell your information to advertisers or marketers.
              </p>
            </div>

            {/* Cookies Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-xl mr-4">
                  <FaCog className="text-yellow-600 dark:text-yellow-400 text-xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cookies</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                We use essential cookies to remember your preferences and improve your shopping experience. 
                You can control cookie settings in your browser preferences.
              </p>
            </div>
          </div>

          {/* Global Trust Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Trusted <span className="bg-gradient-to-r from-[#0D3B66] to-[#1E5CAF] bg-clip-text text-transparent">Worldwide</span>
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Our commitment to privacy and security has earned the trust of customers across multiple countries. 
                We maintain the highest standards of data protection regardless of where you shop from.
              </p>
            </div>
            
            <div className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative font-sans">
              <WorldMap
                dots={[
                  { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: 35.6762, lng: 139.6503 } },
                  { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: 53.3498, lng: -6.2603 } },
                  { start: { lat: 27.7172, lng: 85.3240 }, end: { lat: -25.2744, lng: 133.7751 } },
                  { start: { lat: 28.6139, lng: 77.209 }, end: { lat: 27.6648, lng: -81.5158 } },
                  { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: 53.3498, lng: -6.2603 } },
                  { start: { lat: -25.2744, lng: 133.7751 }, end: { lat: 27.6648, lng: -81.5158 } },
                ]}
                lineColor="#0D3B66"
              />
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Secure shopping experience across 50+ countries with local data protection compliance
              </p>
            </div>
          </div>

          {/* Additional Privacy Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {/* Data Retention Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-xl mr-4">
                  <FaBell className="text-indigo-600 dark:text-indigo-400 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Data Retention</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We retain your personal information only as long as necessary to provide our services and comply with legal obligations. 
                Order information is kept for 7 years for tax purposes, while account data can be deleted upon request.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Retention Periods:</strong><br/>
                  • Account data: Until deletion request<br/>
                  • Order history: 7 years<br/>
                  • Payment info: Not stored<br/>
                  • Marketing data: Until opt-out
                </p>
              </div>
            </div>

            {/* International Compliance Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="bg-teal-100 dark:bg-teal-900/30 p-4 rounded-xl mr-4">
                  <FaGlobe className="text-teal-600 dark:text-teal-400 text-2xl" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Global Compliance</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                We comply with international privacy laws including GDPR, CCPA, and local data protection regulations. 
                Our practices are regularly audited to ensure we meet the highest standards of data protection.
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Compliance Standards:</strong><br/>
                  • GDPR (EU)<br/>
                  • CCPA (California)<br/>
                  • PIPEDA (Canada)<br/>
                  • Local regulations
                </p>
              </div>
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
