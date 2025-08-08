'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import LoginForm from '../forms/LoginForm';
import SignupForm from '../forms/SignupForm';

const Navbar = () => {
  const [modalType, setModalType] = useState<null | 'login' | 'signup'>(null);
  const closeModal = () => setModalType(null);

  const handleLoginSubmit = (values: { email: string; password: string }) => {
    console.log('Login submitted:', values);
    closeModal();
    // Call login API here
  };

  const handleSignupSubmit = (values: { name: string; email: string; password: string }) => {
    console.log('Signup submitted:', values);
    closeModal();
    // Call signup API here
  };

  return (
    <>
      <div className="bg-[#f85606] text-sm text-white px-4 py-2 flex justify-end gap-4">
        <button onClick={() => setModalType('login')} className="hover:underline">LOGIN</button>
        <button onClick={() => setModalType('signup')} className="hover:underline">SIGN UP</button>
      </div>

      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={closeModal}
        >
          <div
            className="bg-white text-black p-6 rounded shadow-md w-96 relative transition-transform duration-300 ease-in-out scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {modalType === 'login' ? (
              <>
                <LoginForm onSubmit={handleLoginSubmit} />
                <p className="mt-4 text-sm text-center">
                  Don't have an account?{' '}
                  <button
                    onClick={() => setModalType('signup')}
                    className="text-[#f85606] hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                <SignupForm onSubmit={handleSignupSubmit} />
                <p className="mt-4 text-sm text-center">
                  Already have an account?{' '}
                  <button
                    onClick={() => setModalType('login')}
                    className="text-[#f85606] hover:underline font-medium"
                  >
                    Log In
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
