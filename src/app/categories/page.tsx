// app/categories/page.tsx
import type { Metadata } from "next";
import CategoriesClient from "../../components/CategoriesClient";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "Browse calculator categories on Numora. Health, Finance, Unit Conversions, Math & Science, and Everyday Life calculators all in one place.",
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
