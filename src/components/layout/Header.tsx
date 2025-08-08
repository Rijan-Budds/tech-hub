import React from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";
import { ModeToggle } from "@/components/ui/mode-toggle";

const Header = () => {
  return (
    <header>
      <Navbar />

      <div className="bg-[#f85606] px-4 py-4 flex items-center justify-between">
        {/* Title - now redirects to home */}
        <Link href="/" className="text-white font-bold text-xl ">
          Ecommerce website
        </Link>

        {/* Search Bar */}
        <div className="flex flex-1 max-w-xl mx-6">
          <input
            type="text"
            placeholder="Search for item..."
            className="w-full px-4 py-2 rounded-l-md focus:outline-none bg-white text-black"
          />
          <button className="bg-[#febd69] px-4 py-2 rounded-r-md text-black">
            <FaSearch />
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-4">
          <Link href="/profile" className="hover:text-gray-200">
            <FaUser />
          </Link>
          <Link href="/cart" className="hover:text-gray-200">
            <FaShoppingCart />
          </Link>
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
