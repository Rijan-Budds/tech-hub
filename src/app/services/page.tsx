"use client";

import React from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  FaTools,
  FaDesktop,
  FaMicrochip,
  FaWrench,
  FaHeadset,
  FaBroom,
} from "react-icons/fa";

export default function ServicesPage() {
  const services = [
    {
      icon: <FaWrench className="w-8 h-8 text-white" />,
      title: "PC Diagnostics & Repair",
      description:
        "Is your computer running slow or not turning on? Our expert technicians will diagnose the issue and get your system back to peak performance.",
    },
    {
      icon: <FaDesktop className="w-8 h-8 text-white" />,
      title: "Custom PC Building",
      description:
        "Dreaming of the perfect gaming rig or workstation? We'll help you pick the best parts and professionally assemble your custom build.",
    },
    {
      icon: <FaMicrochip className="w-8 h-8 text-white" />,
      title: "Hardware Upgrades",
      description:
        "Boost your PC's speed and capabilities. We install RAM, SSDs, graphics cards, and processors to extend your computer's lifespan.",
    },
    {
      icon: <FaHeadset className="w-8 h-8 text-white" />,
      title: "Software Support",
      description:
        "Trouble with Windows, drivers, or viruses? We provide comprehensive software support, including OS installation and malware removal.",
    },
    {
      icon: <FaBroom className="w-8 h-8 text-white" />,
      title: "Deep Cleaning",
      description:
        "Dust and heat can kill your PC. Our deep cleaning service removes improved airflow and applies premium thermal paste for better cooling.",
    },
    {
      icon: <FaTools className="w-8 h-8 text-white" />,
      title: "Tech Consultation",
      description:
        "Not sure what you need? Book a consultation with us. We'll give you honest advice on upgrades, new purchases, and network setups.",
    },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our <span className="text-black">Services</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We provide professional tech solutions to keep you running
              smoothly. From repairs to custom builds, we&apos;ve got you
              covered.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-md transform -rotate-3">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
