import React from "react";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {
  return (
    <>
    <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your privacy matters to us. This policy explains what we collect and how we use it.
        </p>
      </header>

      <section className="p-6 rounded border bg-white dark:bg-gray-900 dark:text-white space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Information We Collect</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Account details (name, email), order information, addresses, and basic site activity.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-1">How We Use Information</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
            <li>Process orders and provide support</li>
            <li>Improve our services and site performance</li>
            <li>Communicate updates related to your orders</li>
          </ul>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-1">Cookies</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We use cookies for authentication and session management to keep you signed in.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-1">Data Sharing</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We do not sell your personal data. We share limited info with payment and delivery partners when necessary to fulfill your order.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-1">Your Choices</h2>
          <p className="text-gray-600 dark:text-gray-300">
            You can update account details, request data deletion, and opt out of non-essential communications.
          </p>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          For questions, contact support@techstore.example
        </p>
      </section>
    </main>
    <Footer />
    </>
  );
}