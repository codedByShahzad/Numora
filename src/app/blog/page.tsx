import type { Metadata } from "next";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = {
  title: "Blogs | Numora",
  description:
    "Clear explainers, product notes, and practical guides — in Numora style.",
};

export default function BlogPage() {
  return <BlogListClient />;
}
