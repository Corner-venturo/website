import { flightReminders } from '../constants';

export default function FlightRemindersCard() {
  return (
    <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-morandi-yellow/10 rounded-bl-full -mr-4 -mt-4" />
      <div className="flex items-center gap-2 mb-3 relative z-10">
        <span className="material-icons-round text-primary">tips_and_updates</span>
        <span className="font-bold text-sm text-gray-700">重要提示</span>
      </div>
      <ul className="text-xs text-gray-500 space-y-2.5 list-none relative z-10">
        {flightReminders.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
