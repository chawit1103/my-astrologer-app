// components/Footer.jsx
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111827] text-gray-300 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
          {/* Copyright Section */}
          <div className="mb-4 md:mb-0">
            <p>&copy; {currentYear} My Astro. All rights reserved.</p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center space-x-6 md:space-x-8">
            <Link href="/privacy-policy" className="hover:text-white transition duration-300 ease-in-out">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/terms-of-service" className="hover:text-white transition duration-300 ease-in-out">
              ข้อกำหนดและเงื่อนไข
            </Link>
            <Link href="/contact" className="hover:text-white transition duration-300 ease-in-out">
              ติดต่อเรา
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}