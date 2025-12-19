import { useRef } from "react";
import Image from "next/image";

interface AvatarUploadProps {
  avatarPreview: string | null;
  onAvatarChange: (file: File) => void;
}

export default function AvatarUpload({ avatarPreview, onAvatarChange }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onAvatarChange(file);
    }
  };

  return (
    <div className="flex justify-center">
      <button type="button" onClick={() => fileInputRef.current?.click()} className="relative group">
        <div className="w-28 h-28 rounded-full bg-white/60 backdrop-blur-xl border-2 border-dashed border-[var(--neutral-300)] overflow-hidden flex items-center justify-center group-hover:border-[var(--morandi-blue)] transition">
          {avatarPreview ? (
            <Image src={avatarPreview} alt="Avatar" fill className="object-cover" />
          ) : (
            <svg
              className="w-10 h-10 text-[var(--neutral-400)]"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--morandi-blue)] rounded-full flex items-center justify-center text-white shadow-lg">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
            />
          </svg>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />
      </button>
    </div>
  );
}
