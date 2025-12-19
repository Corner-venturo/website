export interface Trip {
  id: number;
  title: string;
  date: string;
  status: "upcoming" | "planning" | "completed";
  statusLabel: string;
  statusColor: string;
  image: string;
  members: number;
  totalSpent: number;
  myBalance: number;
}
