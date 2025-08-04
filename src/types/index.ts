
export interface RaceEvent {
  id: string;
  category: string;
  categoryShortName: string;
  circuitName: string;
  location: string;
  date: string;
  schedule: { day: string; activity: string; time: string }[];
  circuitImage: string;
  circuitImageHint: string;
  calendarUrl: string;
}
