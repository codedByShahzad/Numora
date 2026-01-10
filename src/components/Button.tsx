// components/Button.tsx
import Link from "next/link";

export default function Button({ title, id }: { title: string; id: string }) {
  return (
    <Link
      href={`/categories/${id}`}
      className="
        inline-flex items-center justify-center
        rounded-full
        px-5 py-2.5
        text-sm font-semibold
        text-white
        bg-gradient-to-r from-sky-500 to-indigo-600
        shadow-sm
        hover:shadow-md
        hover:brightness-105
        transition
        whitespace-nowrap
      "
    >
      Explore {title}
    </Link>
  );
}
