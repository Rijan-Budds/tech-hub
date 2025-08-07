import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  return (
    <div className="bg-[#f85606] text-sm text-white px-4 py-2 flex justify-end gap-4">
      <a href="#" className="hover:underline">SAVE MORE ON APP</a>
      <a href="#" className="hover:underline">BECOME A SELLER</a>
      <a href="#" className="hover:underline">HELP & SUPPORT</a>
      <Link href="/login" className="hover:underline">LOGIN</Link>
      <a href="#" className="hover:underline">SIGN UP</a>
    </div>
  );
};

export default Navbar;
