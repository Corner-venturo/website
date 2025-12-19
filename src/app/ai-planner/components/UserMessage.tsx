interface UserMessageProps {
  content: string;
}

export default function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex gap-3 flex-row-reverse">
      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden border-2 border-white">
        <span className="material-icons-round text-gray-500 text-[18px]">person</span>
      </div>
      <div className="flex flex-col gap-1 items-end max-w-[85%]">
        <div className="bg-[#D6C4B4] text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-sm text-sm leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
}
