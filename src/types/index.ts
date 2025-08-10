export interface Race {
  id: string;
  name: string;
  logo: string;
  url: string;
}

export interface ScheduleEvent {
  day: string;
  time: string;
  name: string;
  fullDateTime: string; // Fecha y hora en formato ISO para cálculos
  status: 'Finalizada' | 'Próxima' | string;
  link?: string;
}

export interface RaceData {
  id: string;
  category: string;
  raceName: string;
  circuit: string;
  countdownTarget: string | null;
  nextEventName?: string;
  schedule?: ScheduleEvent[];
  hasCalendar: boolean;
  isLive: boolean;
  liveUrl?: string;
}
