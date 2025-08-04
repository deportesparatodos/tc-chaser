import { CarFront, Truck } from 'lucide-react';
import type { RaceEvent } from '@/types';
import * as cheerio from 'cheerio';

const countdownRegex = /year\s*=\s*(\d{4});\s*month\s*=\s*(\d{1,2});\s*day\s*=\s*(\d{1,2});\s*hour\s*=\s*(\d{1,2});\s*min\s*=\s*(\d{1,2});/;

const categoryMappings: { [key: string]: Partial<RaceEvent> & { url: string, type: 'actc' | 'tc2000' } } = {
  tc: {
    id: 'tc',
    category: 'Turismo Carretera',
    Icon: CarFront,
    url: 'https://actc.org.ar/tc/calendario.html',
    type: 'actc',
  },
  tcp: {
    id: 'tcp',
    category: 'TC Pista',
    Icon: CarFront,
    url: 'https://actc.org.ar/tcp/calendario.html',
    type: 'actc',
  },
  tcm: {
    id: 'tcm',
    category: 'TC Mouras',
    Icon: CarFront,
    url: 'https://actc.org.ar/tcm/calendario.html',
    type: 'actc',
  },
  tcpm: {
    id: 'tcpm',
    category: 'TC Pista Mouras',
    Icon: CarFront,
    url: 'https://actc.org.ar/tcpm/calendario.html',
    type: 'actc',
  },
  tcpk: {
    id: 'tcpk',
    category: 'TC Pick Up',
    Icon: Truck,
    url: 'https://actc.org.ar/tcpk/calendario.html',
    type: 'actc',
  },
  tcppk: {
    id: 'tcppk',
    category: 'TC Pista Pick Up',
    Icon: Truck,
    url: 'https://actc.org.ar/tcppk/calendario.html',
    type: 'actc',
  },
  tc2000: {
    id: 'tc2000',
    category: 'TC2000',
    Icon: CarFront,
    url: 'https://tc2000.com.ar/carreras.php?evento=calendario',
    type: 'tc2000',
  }
};

const getStaticRaceData = (): RaceEvent[] => {
  console.warn("Using static race data due to a fallback.");
  const now = new Date();
  return Object.values(categoryMappings).map((cat, index) => {
    const raceDate = new Date(now);
    raceDate.setDate(now.getDate() + 7 * (index + 1));
    return {
      id: cat.id!,
      category: cat.category!,
      Icon: cat.Icon!,
      circuitName: 'Autódromo Placeholder',
      location: 'Ciudad Genérica, Provincia Genérica',
      date: raceDate.toISOString(),
      schedule: [],
      circuitImage: `https://placehold.co/600x400.png`,
      circuitImageHint: 'race track',
      calendarUrl: cat.url,
    };
  });
};

const monthMap: { [key: string]: number } = {
    'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
};

const parseActcDate = (day: string, monthStr: string): Date | null => {
    const month = monthMap[monthStr.toLowerCase()];
    if (month === undefined) return null;
    let year = new Date().getFullYear();
    const currentDate = new Date();
    if (currentDate.getMonth() > month) {
        year += 1;
    }
    return new Date(year, month, parseInt(day, 10));
}

const parseTc2000Date = (dateStr: string): Date | null => {
    const [day, month] = dateStr.split('-').map(s => parseInt(s.trim(), 10));
    if (isNaN(day) || isNaN(month)) return null;

    let year = new Date().getFullYear();
    const currentDate = new Date();
    // Month from site is 1-based, Date object is 0-based
    if (currentDate.getMonth() > (month - 1)) {
        year += 1;
    }
    // Set to the beginning of the day in local time
    const raceDate = new Date(year, month - 1, day);
    raceDate.setHours(0, 0, 0, 0);
    return raceDate;
}

export const getRaceData = async (): Promise<RaceEvent[]> => {
  try {
    const allRaces: RaceEvent[] = [];

    for (const key in categoryMappings) {
        const categoryInfo = categoryMappings[key as keyof typeof categoryMappings];
        
        let response;
        try {
            response = await fetch(categoryInfo.url, { next: { revalidate: 3600 } });
            if (!response.ok) {
                console.error(`Failed to fetch calendar for ${key}: ${response.statusText}`);
                continue;
            }
        } catch (error) {
            console.error(`Error fetching calendar for ${key}:`, error);
            continue;
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        
        let nextRace: RaceEvent | null = null;

        if (categoryInfo.type === 'actc') {
            const raceElements = $('.calendario-temporada .info-race');
            let nextRaceDate: Date | null = null;

            raceElements.each((_i, el) => {
                const day = $(el).find('.date span').text().trim();
                const month = $(el).find('.date').clone().children().remove().end().text().trim();
                const circuitName = $(el).find('.hd h2').text().trim();
                const location = $(el).find('.hd p').text().trim();
                const image = $(el).find('figure img').attr('data-original');

                const raceDate = parseActcDate(day, month);

                if (raceDate && raceDate >= new Date()) {
                    if (!nextRaceDate || raceDate < nextRaceDate) {
                        nextRaceDate = raceDate;
                        nextRace = {
                            id: categoryInfo.id!,
                            category: categoryInfo.category!,
                            Icon: categoryInfo.Icon!,
                            circuitName,
                            location,
                            date: '', // Will be updated later
                            schedule: [],
                            circuitImage: image ? `https://actc.org.ar${image}` : 'https://placehold.co/600x400.png',
                            circuitImageHint: 'race track',
                            calendarUrl: categoryInfo.url,
                        };
                    }
                }
            });

            if (nextRace) {
                const indexUrl = `https://actc.org.ar/${key}/index.html`;
                try {
                    const indexResponse = await fetch(indexUrl, { next: { revalidate: 3600 } });
                    if (indexResponse.ok) {
                        const indexHtml = await indexResponse.text();
                        const countdownMatch = indexHtml.match(countdownRegex);
                        if (countdownMatch) {
                            const [, year, month, day, hour, min] = countdownMatch;
                            const raceDateObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min));
                            nextRace.date = raceDateObj.toISOString();
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching index page for ${key}:`, error);
                }
                
                if (!nextRace.date && nextRaceDate) {
                   nextRace.date = nextRaceDate.toISOString();
                }
            }

        } else if (categoryInfo.type === 'tc2000') {
            const raceElements = $('.box-fechas');
            let nextRaceDate: Date | null = null;
            
            raceElements.each((_i, el) => {
                const dateStr = $(el).find('h2 .gris').text().trim();
                const circuitName = $(el).find('h3').text().trim();
                 // Location is not explicitly provided, using circuit name as fallback
                const location = circuitName; 
                const image = $(el).find('.imagen_autodromo').attr('src');
                
                const raceDate = parseTc2000Date(dateStr);

                if (raceDate && raceDate >= new Date()) {
                     if (!nextRaceDate || raceDate < nextRaceDate) {
                        nextRaceDate = raceDate;
                        nextRace = {
                            id: categoryInfo.id!,
                            category: categoryInfo.category!,
                            Icon: categoryInfo.Icon!,
                            circuitName,
                            location,
                            date: raceDate.toISOString(), // Use the parsed date directly
                            schedule: [],
                            circuitImage: image ? image : 'https://placehold.co/600x400.png',
                            circuitImageHint: 'race track',
                            calendarUrl: categoryInfo.url,
                        };
                    }
                }
            });
        }
        
        if (nextRace && nextRace.date) {
            allRaces.push(nextRace);
        }
    }

    if (allRaces.length === 0) {
        console.error("Scraping finished, but no upcoming race data was found. Falling back to static data.");
        return getStaticRaceData();
    }
    
    return allRaces.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('An unexpected error occurred during scraping:', error);
    return getStaticRaceData();
  }
};
