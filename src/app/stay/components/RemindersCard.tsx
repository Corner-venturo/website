interface RemindersCardProps {
  reminders: string[];
  phone: string;
}

export default function RemindersCard({ reminders, phone }: RemindersCardProps) {
  return (
    <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-morandi-yellow/10 rounded-bl-full -mr-4 -mt-4" />
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className="material-icons-round text-primary">info</span>
        <span className="font-bold text-sm text-gray-700">入住須知</span>
      </div>
      <ul className="text-xs text-gray-500 space-y-3 list-none relative z-10">
        {reminders.map((item) => (
          <li key={item} className="flex gap-2.5 items-start">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
            <span>{item}</span>
          </li>
        ))}
        <li className="flex gap-2.5 items-start">
          <div className="bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-600 font-mono flex items-center gap-1">
            <span className="material-icons-round text-[10px]">call</span>
            {phone}
          </div>
        </li>
      </ul>
    </div>
  );
}
