"use client";

import Link from "next/link";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navMenu = [
    { title: "Home", href: "/" },
    { title: "Categories", href: "/categories" },
    { title: "About", href: "/about" },
    { title: "Blogs", href: "/blog" },
  ];

  return (
    <nav className=" top-0 z-[9999] border-b border-gray-200 bg-white/70 backdrop-blur-md relative">
      <div className="max-w-[100rem] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" width={25} height={25} alt="Numoro logo" />
          <h1 className="text-xl font-semibold text-gray-900">Numoro</h1>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex gap-6 text-gray-700">
            {navMenu.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-blue-600 transition">
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>

          {/* Contact Button */}
          <Link
            href="/contact"
            className="ml-2 rounded-lg bg-gradient-to-r from-[#008FBE] to-[#125FF9] text-white px-4 py-2 text-sm font-medium"
          >
            Contact
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full border-t border-gray-200 bg-white shadow-md md:hidden z-[9999]">
          <ul className="flex flex-col gap-4 p-4 text-gray-700">
            {[...navMenu, { title: "Contact", href: "/contact" }].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-md px-3 py-2 hover:bg-gray-50 hover:text-blue-600 transition"
                  onClick={() => setIsOpen(false)}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
