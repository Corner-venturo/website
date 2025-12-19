import Image from "next/image";
import Link from "next/link";

interface ChatHeaderProps {
  avatarUrl: string;
}

export default function ChatHeader({ avatarUrl }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-50 px-5 py-4 bg-[#F7F5F2]/95 backdrop-blur-md flex items-center gap-3">
      <Link
        href="/"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
      >
        <span className="material-icons-round text-gray-800 text-[22px]">arrow_back</span>
      </Link>
      <div className="flex-1 flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#Cfb9a5] flex items-center justify-center shadow-sm overflow-hidden">
          <Image
            src={avatarUrl}
            alt="威廉"
            width={32}
            height={32}
            className="w-full h-full object-cover"
            priority
          />
        </div>
        <span className="font-bold text-gray-800">跟威廉聊聊</span>
      </div>
    </header>
  );
}
