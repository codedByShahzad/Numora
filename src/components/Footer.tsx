import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png";
import { CATEGORIES, categoryPath } from "@/lib/site/catalog";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "All categories", href: "/categories/" },
    { name: "Blog", href: "/blog/" },
    { name: "About", href: "/about/" },
    { name: "Contact", href: "/contact/" },
  ];

  const categories = CATEGORIES.map((c) => ({ name: c.name, href: categoryPath(c.slug) }));

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-gray-900 font-semibold tracking-wide inline-block">
      <span
        className="relative inline-block
        after:absolute after:left-0 after:-bottom-2
        after:h-[2px] after:w-full after:bg-cyan-700"
      >
        {children}
      </span>
    </h2>
  );

  return (
    <footer className="bg-gray-50 text-gray-700 border-t border-gray-200">
      <div className="max-w-[100rem] mx-auto px-6 py-12">
        {/* TOP */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* BRAND */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Image src={logo} alt="" className="w-8 h-auto" />
              <p className="text-2xl font-semibold text-gray-900">Numoro</p>
            </div>

            <p className="mt-4 sm:text-lg text-gray-600 leading-relaxed max-w-md">
              Free calculators for tax, seller fees, payments, energy, health, finance and everyday math. Every result shows how it was worked out.
            </p>
          </div>

          {/* LINKS AREA */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-10">
            {/* QUICK LINKS */}
            <div>
              <Heading>Quick Links</Heading>
              <ul className="mt-6 space-y-3">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="relative inline-block text-gray-600 transition
                        after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                        after:w-0 after:bg-cyan-700 after:transition-all after:duration-300
                        hover:text-cyan-700 hover:after:w-full"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CATEGORIES */}
            <div>
              <Heading>Categories</Heading>
              <ul className="mt-6 space-y-3">
                {categories.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="relative inline-block text-gray-600 transition
                        after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                        after:w-0 after:bg-cyan-700 after:transition-all after:duration-300
                        hover:text-cyan-700 hover:after:w-full"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CONTACT */}
            <div>
              <Heading>Contact</Heading>
              <div className="mt-6 space-y-5 text-gray-600">
                <div>
                  <p className="text-sm text-gray-500">Mail Us</p>
                  <a
                    href="mailto:support@numoro.net"
                    className="hover:text-cyan-700 transition"
                  >
                    support@numoro.net
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Numoro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
