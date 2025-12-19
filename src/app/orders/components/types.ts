export type FilterType = "all" | "upcoming" | "pending" | "planning";

export interface StatusTag {
  label: string;
  tone: string;
  href?: string;
}

export interface Order {
  id: string;
  month: string;
  day: string;
  chipText: string;
  chipColor: string;
  title: string;
  dateRange: string;
  travelers: string;
  progress?: number;
  total?: string;
  actionLabel?: string;
  filter: FilterType;
  statusTags?: StatusTag[];
  image?: string;
}
