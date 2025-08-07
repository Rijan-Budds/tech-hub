import React from "react";

function Footer() {
  return (
    <footer className="bg-[#f85606] text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
        {/* Company Info */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">Ecommerce website</h2>
          <p className="text-sm max-w-xs">
            Bringing you the best products since 2025. Quality and service you
            can trust.
          </p>
          <p className="mt-2 text-xs opacity-80">
            © {new Date().getFullYear()} Ecommerce website. All rights reserved.
          </p>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col space-y-2 text-sm text-white/90">
          <a href="#" className="hover:underline">
            Home
          </a>
          <a href="#" className="hover:underline">
            About Us
          </a>
          <a href="#" className="hover:underline">
            Services
          </a>
          <a href="#" className="hover:underline">
            Contact
          </a>
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
        </nav>

        <div className="flex space-x-4 text-2xl">
          <a href="#" aria-label="Facebook" className="hover:text-white/80">
            facebook
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-white/80">
            twitter
          </a>
          <a href="#" aria-label="Instagram" className="hover:text-white/80">
            instagram
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-white/80">
            linkedin
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
