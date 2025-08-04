import type { LucideIcon } from "lucide-react";

export interface RaceEvent {
  id: string;
  category: string;
  categoryFullName: string;
  Icon: LucideIcon;
  circuitName: string;
  location: string;
  date: string;
  schedule: { day: string; activity: string; time: string }[];
  circuitImage: string;
  circuitImageHint: string;
}
