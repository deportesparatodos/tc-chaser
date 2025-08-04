import { CarFront, Truck } from 'lucide-react';
import type { RaceEvent } from '@/types';

const categoryMappings: { [key: string]: Partial<RaceEvent> } = {
  tc: {
    id: 'tc',
    category: 'TC',
    categoryFullName: 'Turismo Carretera',
    Icon: CarFront,
  },
  tcp: {
    id: 'tcp',
    category: 'TCP',
    categoryFullName: 'TC Pista',
    Icon: CarFront,
  },
  tcm: {
    id: 'tcm',
    category: 'TCM',
    categoryFullName: 'TC Mouras',
    Icon: CarFront,
  },
  tcpm: {
    id: 'tcpm',
    category: 'TCPM',
    categoryFullName: 'TC Pista Mouras',
    Icon: CarFront,
  },
  tcpk: {
    id: 'tcpk',
    category: 'TCPK',
    categoryFullName: 'TC Pick Up',
    Icon: Truck,
  },
  tcppk: {
    id: 'tcppk',
    category: 'TCPPK',
    categoryFullName: 'TC Pista Pick Up',
    Icon: Truck,
  },
};

// Static data fallback
const getStaticRaceData = (): RaceEvent[] => {
  const now = new Date();
  
  return Object.keys(categoryMappings).map((key, index) => {
    const cat = categoryMappings[key as keyof typeof categoryMappings];
    const raceDate = new Date(now);
    raceDate.setDate(now.getDate() + 7 * (index + 1));
    
    return {
      id: cat.id!,
      category: cat.category!,
      categoryFullName: cat.categoryFullName!,
      Icon: cat.Icon!,
      circuitName: 'Autódromo Placeholder',
      location: 'Ciudad Genérica',
      date: raceDate.toISOString(),
      schedule: [
        { day: 'Viernes', activity: 'Entrenamiento 1', time: '10:00' },
        { day: 'Sábado', activity: 'Clasificación', time: '15:00' },
        { day: 'Domingo', activity: 'Carrera', time: '13:30' },
      ],
      circuitImage: 'https://placehold.co/600x400.png',
      circuitImageHint: 'race track',
    };
  });
}

export const getRaceData = async (): Promise<RaceEvent[]> => {
    // Since scraping is unreliable in this environment, we will use static data.
    console.warn("Using static race data. Scraping has been disabled due to environment issues.");
    return getStaticRaceData();
};
