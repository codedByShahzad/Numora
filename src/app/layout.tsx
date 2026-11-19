import Navbar from "@/components/Navbar";
import "./globals.css";
import Footer from "@/components/Footer";
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Numoro – Fast Everyday Calculators",
    template: "%s | Numoro",
  },
  description:
    "Numoro helps you calculate BMI, calories, EMI, interest, and unit conversions instantly with clean breakdowns and standard formulas.",

  metadataBase: new URL("https://numoro.net"),

 icons: {
  icon: "/favicon.ico",
},

  openGraph: {
    title: "Numoro – Fast Everyday Calculators",
    description:
      "Health, finance, unit conversions, math, science, and everyday calculators in one fast, clean platform.",
    url: "/",
    siteName: "Numoro",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Numoro – Fast Everyday Calculators",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Numoro – Fast Everyday Calculators",
    description:
      "Fast, clean calculators for health, finance, conversions, and everyday life.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#125FF9] focus:shadow"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
