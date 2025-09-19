"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaUser, FaSignOutAlt } from "react-icons/fa";
import { RiAdminFill } from "react-icons/ri";

import { ModeToggle } from "@/components/ui/mode-toggle";
import LoginForm from "@/components/forms/LoginForm";
import SignupForm from "@/components/forms/SignupForm";

interface CurrentUser {
  id: string;
  email: string;
  username: string;
  role?: "user" | "admin";
}

const AdminHeader = () => {
  const [modalType, setModalType] = useState<null | "login" | "signup">(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const closeModal = () => setModalType(null);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch("/api/me", { credentials: "include" });
        const data = await res.json();
        setCurrentUser(data.user);
      } catch {
        setCurrentUser(null);
      }
    };
    loadMe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginSubmit = () => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => setCurrentUser(null));
    closeModal();
  };

  const handleSignupSubmit = () => {
    fetch("/api/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setCurrentUser(d.user))
      .catch(() => setCurrentUser(null));
    closeModal();
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      setCurrentUser(null);
      setDropdownOpen(false);
      router.push("/");
    } catch {
      // ignore
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-br from-[#0D3B66] via-[#154A8A] to-[#1E5CAF] text-white shadow-lg">
      {/* Admin header: Logo, Admin title, User actions */}
      <div className="flex items-center justify-between px-4 py-3 gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Image
            src="/home/logo.jpg"
            alt="Wayne Logo"
            width={60}
            height={60}
            className="sm:w-[75px] sm:h-[75px] lg:w-[85px] lg:h-[85px]"
            priority
          />
        </Link>

        {/* Admin Dashboard Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
            Admin Dashboard
          </h1>
        </div>

        {/* Right side: User actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* User Icon with Dropdown */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center justify-center hover:text-gray-200 w-8 h-8 sm:w-9 sm:h-9"
              >
                <FaUser className="w-5 h-5 sm:w-5 sm:h-5" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-lg z-50 border border-gray-200 dark:border-gray-700 py-2">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser.username}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser.email}
                    </p>
                    {currentUser.role === "admin" && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                        Administrator
                      </p>
                    )}
                  </div>

                  <div className="py-1">
                    {/* Admin Dashboard Link - always visible for admins */}
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <RiAdminFill className="w-4 h-4 mr-3" />
                      Admin Dashboard
                    </Link>

                    {/* Home/Shop Link */}
                    <Link
                      href="/"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="w-4 h-4 mr-3">🏠</span>
                      Back to Shop
                    </Link>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FaSignOutAlt className="w-4 h-4 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setModalType("login")}
              className="hover:underline text-sm sm:text-base"
            >
              LOGIN
            </button>
          )}

          <ModeToggle />
        </div>
      </div>

      {/* Login/Signup Modal */}
      {modalType && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 text-black dark:text-white p-4 sm:p-6 rounded shadow-md w-full max-w-sm sm:max-w-md mx-4 relative transition-transform duration-300 ease-in-out scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              ✕
            </button>

            {modalType === "login" ? (
              <>
                <LoginForm onSubmit={handleLoginSubmit} />
                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => setModalType("signup")}
                    className="text-primary hover:underline font-medium"
                  >
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                <SignupForm onSubmit={handleSignupSubmit} />
                <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <button
                    onClick={() => setModalType("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Log In
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader;
