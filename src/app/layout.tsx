import Navbar from "@/components/Navbar";
import "./globals.css";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Numoro – Fast Everyday Calculators",
    template: "%s | Numoro",
  },
  description:
    "Numoro helps you calculate BMI, calories, EMI, interest, and unit conversions instantly with clean breakdowns and standard formulas.",

  metadataBase: new URL("https://numorrra.netlify.app"),

  icons: {
    icon: "/logo.png",
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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
