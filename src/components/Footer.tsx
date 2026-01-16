import Image from "next/image";
import Link from "next/link";
import logo from "../../public/logo.png"

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Categories", href: "/categories" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const categories = [
    { name: "Health", href: "/categories/health" },
    { name: "Finance", href: "/categories/finance" },
    { name: "Unit Conversions", href: "/categories/unit-conversions" },
    { name: "Maths & Science", href: "/categories/maths-science" },
    { name: "Everyday Life", href: "/categories/everyday-life" },
  ];

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h3 className="text-gray-900 font-semibold tracking-wide inline-block">
      <span
        className="relative inline-block
        after:absolute after:left-0 after:-bottom-2
        after:h-[2px] after:w-full after:bg-cyan-700"
      >
        {children}
      </span>
    </h3>
  );

  return (
    <footer className="bg-gray-50 text-gray-700 border-t border-gray-200">
      <div className="max-w-[100rem] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* BRAND */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <Image src={logo} alt="logo" className=" w-8" />
              <h2 className="text-2xl font-semibold text-gray-900">
                Numoro
              </h2>
            </div>

            <p className="mt-4 sm:text-lg text-gray-600 leading-relaxed max-w-md">
              Your trusted calculation hub for health, finance, science, and
              everyday math. Simple, accurate, and always free.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <Heading>Quick Links</Heading>
            <ul className="mt-6 space-y-3">
              {quickLinks.map((item, idx) => (
                <li key={idx}>
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
              {categories.map((item, idx) => (
                <li key={idx}>
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
                <p className="hover:text-cyan-700 transition">
                  support@Numoro.app
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Call Us</p>
                <p className="hover:text-cyan-700 transition">
                  Book a call now
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Office</p>
                <p>Pakistan — Lahore</p>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Numoro. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-sm text-gray-500">
            {["Twitter", "LinkedIn", "GitHub"].map((item) => (
              <Link
                key={item}
                href="#"
                className="relative inline-block transition
                  after:absolute after:left-0 after:-bottom-1 after:h-[2px]
                  after:w-0 after:bg-cyan-700 after:transition-all after:duration-300
                  hover:text-cyan-700 hover:after:w-full"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
