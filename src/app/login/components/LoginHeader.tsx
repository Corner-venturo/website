import Link from "next/link";

export default function LoginHeader() {
  return (
    <header className="flex-shrink-0 p-4 pt-12">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-[#949494] hover:text-[#5C5C5C] transition"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
        <span className="text-sm font-medium">返回首頁</span>
      </Link>
    </header>
  );
}
