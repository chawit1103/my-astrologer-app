// components/Navbar.jsx
'use client'; // This is a Client Component

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-[#111827] text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-white tracking-wide">
              My Astro
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-lg font-medium hover:text-gray-300 transition duration-300 ease-in-out">
              หน้าแรก
            </Link>
            <Link href="/packages" className="text-lg font-medium hover:text-gray-300 transition duration-300 ease-in-out">
              แพ็กเกจ
            </Link>
            <Link href="/login" className="text-lg font-medium bg-white text-[#111827] px-4 py-2 rounded-md hover:bg-gray-200 transition duration-300 ease-in-out">
              เข้าสู่ระบบ
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon for menu toggle */}
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700" onClick={() => setIsOpen(false)}>
              หน้าแรก
            </Link>
            <Link href="/packages" className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700" onClick={() => setIsOpen(false)}>
              แพ็กเกจ
            </Link>
            <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium bg-white text-[#111827] hover:bg-gray-200" onClick={() => setIsOpen(false)}>
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}