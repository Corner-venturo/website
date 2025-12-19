'use client';

import Link from 'next/link';

interface EmptyStateProps {
  compact?: boolean;
  createLink?: string;
}

export default function EmptyState({ compact = false, createLink = '/explore/create' }: EmptyStateProps) {
  return (
    <div className={`${compact ? 'p-4' : 'p-6'} bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 text-center`}>
      <svg
        className={`${compact ? 'w-10 h-10' : 'w-12 h-12'} text-[#B0B0B0] mx-auto ${compact ? 'mb-2' : 'mb-3'}`}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      </svg>
      <p className={`${compact ? 'text-sm' : ''} text-[#949494] ${compact ? 'mb-0' : 'mb-2'}`}>
        附近還沒有揪團
      </p>
      {compact ? (
        <button className="text-xs text-[#94A3B8] font-medium mt-2">
          成為第一個開團的人
        </button>
      ) : (
        <Link href={createLink} className="text-sm text-[#94A3B8] font-medium hover:underline">
          成為第一個開團的人 →
        </Link>
      )}
    </div>
  );
}
