interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}

export default function ChatInput({ value, onChange, onSend }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl rounded-full p-1.5 flex items-center shadow-lg border border-white/40 ring-1 ring-black/5">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 ml-1 text-gray-400">
        <span className="material-icons-round text-[18px]">mic</span>
      </div>
      <input
        className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-gray-700 placeholder-gray-400 px-3 py-1 min-w-0"
        placeholder="想去哪裡玩？"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button
        onClick={onSend}
        className="w-9 h-9 rounded-full bg-[#Cfb9a5] hover:bg-[#b09b88] flex items-center justify-center shrink-0 shadow-sm text-white transition-colors active:scale-95"
      >
        <span className="material-icons-round text-[18px]">send</span>
      </button>
    </div>
  );
}
