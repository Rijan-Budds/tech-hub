import React from "react";
import Link from "next/link";
import Navbar from "./Navbar";
import { FaSearch, FaShoppingCart, FaUser } from "react-icons/fa";

const Header = () => {
  return (
    <header>
      <Navbar />

      <div className="bg-[#f85606] px-4 py-4 flex items-center justify-between">
        <div className="text-white font-bold text-xl">Ecommerce website</div>

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

        <div className="flex items-center gap-4 text-white">
          <a href="#" className="hover:text-gray-200">
            <FaShoppingCart />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
