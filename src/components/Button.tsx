// components/Button.tsx
import Link from "next/link";

export default function Button({ title, id }: { title: string; id: string }) {
  return (
    <Link
      href={`/categories/${id}`}
      className="
        flex w-full items-center justify-center
        rounded-lg
        px-5 py-3
        text-sm font-semibold
        text-white
        bg-gradient-to-r from-sky-500 to-indigo-600
        shadow-sm
        hover:shadow-md
        hover:brightness-105
        transition
      "
    >
      <span className="truncate max-w-full">
        Explore {title}
      </span>
    </Link>
  );
}
