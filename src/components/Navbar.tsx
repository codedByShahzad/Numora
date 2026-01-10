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
    { title: "Contact", href: "/contact" },
  ];

  return (
    <nav className="sticky top-0 border-b border-gray-200 z-50 bg-white/70 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4">
        {/* Logo */}
        <Link href="/">
          <div className="flex gap-2 h-8 justify-center items-center">
            <Image src="/logo.png" width={25} height={25}  alt="logo" />
            <h1 className="text-2xl mb-[2px]">Numora</h1>
          </div>
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-6 text-gray-700 ">
          {navMenu.map((item, index) => (
            <li key={index} className="hover:text-blue-500 transition">
              <Link href={item.href}>{item.title}</Link>
            </li>
          ))}
        </ul>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown (absolute overlay) */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-white backdrop-blur-md border-t border-gray-200 shadow-md md:hidden z-50">
          <ul className="flex flex-col gap-4 p-4 text-gray-700">
            {navMenu.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="block hover:text-blue-500 transition"
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
