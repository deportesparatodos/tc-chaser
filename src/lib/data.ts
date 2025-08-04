import { CarFront, Truck } from 'lucide-react';
import type { RaceEvent } from '@/types';

const countdownRegex = /year\s*=\s*(\d{4});\s*month\s*=\s*(\d{1,2});\s*day\s*=\s*(\d{1,2});\s*hour\s*=\s*(\d{1,2});\s*min\s*=\s*(\d{1,2});/;

const categoryMappings: { [key: string]: Partial<RaceEvent> } = {
  tc: {
    id: 'tc',
    category: 'Turismo Carretera',
    Icon: CarFront,
  },
  tcp: {
    id: 'tcp',
    category: 'TC Pista',
    Icon: CarFront,
  },
  tcm: {
    id: 'tcm',
    category: 'TC Mouras',
    Icon: CarFront,
  },
  tcpm: {
    id: 'tcpm',
    category: 'TC Pista Mouras',
    Icon: CarFront,
  },
  tcpk: {
    id: 'tcpk',
    category: 'TC Pick Up',
    Icon: Truck,
  },
  tcppk: {
    id: 'tcppk',
    category: 'TC Pista Pick Up',
    Icon: Truck,
  },
};

const getStaticRaceData = (): RaceEvent[] => {
  console.warn("Using static race data due to a fallback.");
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
      location: 'Ciudad Genérica, Provincia Genérica',
      date: raceDate.toISOString(),
      schedule: [
        { day: 'Viernes', activity: 'Entrenamiento 1', time: '10:00' },
        { day: 'Sábado', activity: 'Clasificación', time: '15:00' },
        { day: 'Domingo', activity: 'Carrera', time: '13:30' },
      ],
      circuitImage: `https://placehold.co/600x400.png`,
      circuitImageHint: 'race track',
    };
  });
};


const monthMap: { [key: string]: number } = {
    'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
};

const parseDate = (day: string, monthStr: string): Date | null => {
    const month = monthMap[monthStr.toLowerCase()];
    if (month === undefined) return null;
    let year = new Date().getFullYear();
    const currentDate = new Date();
    // If the month is in the past (e.g., it's November and the race is in February), it's for the next year.
    if (currentDate.getMonth() > month) {
        year += 1;
    }
    return new Date(year, month, parseInt(day, 10));
}

export const getRaceData = async (): Promise<RaceEvent[]> => {
  try {
    const allRaces: RaceEvent[] = [];

    for (const key in categoryMappings) {
        const categoryInfo = categoryMappings[key as keyof typeof categoryMappings];
        const url = `https://actc.org.ar/${key}/calendario.html`;
        
        let response;
        try {
            response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
            if (!response.ok) {
                console.error(`Failed to fetch calendar for ${key}: ${response.statusText}`);
                continue;
            }
        } catch (error) {
            console.error(`Error fetching calendar for ${key}:`, error);
            continue;
        }

        const html = await response.text();
        
        // Use a more robust regex to find all list items
        const raceElements = html.match(/<li class="col-lg-4 col-md-4 col-sm-4 col-xs-12">[\s\S]*?<\/li>/g);

        if (!raceElements) {
            continue;
        }

        let nextRace: RaceEvent | null = null;
        let nextRaceDate: Date | null = null;

        for (const element of raceElements) {
            const dateMatch = element.match(/<div class="date"><span>(\d+)<\/span>\s*(\w+)<\/div>/);
            const circuitNameMatch = element.match(/<h2>(.*?)<\/h2>/);
            const locationMatch = element.match(/<p>(.*?)<\/p>/);
            const imageMatch = element.match(/<img class="lazy img-responsive" data-original="(.*?)"/);
            
            if (dateMatch && circuitNameMatch && locationMatch) {
                const day = dateMatch[1];
                const month = dateMatch[2];
                const raceDate = parseDate(day, month);

                // Find the first upcoming race
                if (raceDate && raceDate >= new Date()) {
                    if (!nextRaceDate || raceDate < nextRaceDate) {
                        nextRaceDate = raceDate;
                        nextRace = {
                            id: categoryInfo.id!,
                            category: categoryInfo.category!,
                            categoryFullName: categoryInfo.categoryFullName!,
                            Icon: categoryInfo.Icon!,
                            circuitName: circuitNameMatch[1].trim(),
                            location: locationMatch[1].trim(),
                            date: '', // Will be updated by countdown scraper
                            schedule: [], // Placeholder for now
                            circuitImage: imageMatch ? `https://actc.org.ar${imageMatch[1]}` : 'https://placehold.co/600x400.png',
                            circuitImageHint: 'race track',
                        };
                    }
                }
            }
        }
        
        if (nextRace) {
            const indexUrl = `https://actc.org.ar/${key}/index.html`;
             let indexResponse;
            try {
                indexResponse = await fetch(indexUrl, { next: { revalidate: 3600 } });
                if (!indexResponse.ok) {
                    console.error(`Failed to fetch index page for ${key}: ${indexResponse.statusText}`);
                } else {
                    const indexHtml = await indexResponse.text();
                    const countdownMatch = indexHtml.match(countdownRegex);
                    
                    if (countdownMatch) {
                        const [, year, month, day, hour, min] = countdownMatch;
                        // The month from regex is 1-based, but Date constructor expects 0-based
                        const raceDateObj = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(min));
                        nextRace.date = raceDateObj.toISOString();
                    }
                }
            } catch (error) {
                 console.error(`Error fetching index page for ${key}:`, error);
            }
            
            // If countdown fails, use the date from calendar (if available) as a fallback
            if (!nextRace.date && nextRaceDate) {
               nextRace.date = nextRaceDate.toISOString();
            }

            // Add some mock schedule data since it's not available on the page
             nextRace.schedule = [
                { day: 'Viernes', activity: 'Entrenamientos', time: '10:00' },
                { day: 'Sábado', activity: 'Clasificación', time: '15:00' },
                { day: 'Domingo', activity: 'Carrera', time: '13:00' },
            ];
            
            if (nextRace.date) { // Only add race if we have a valid date
              allRaces.push(nextRace);
            }
        }
    }

    if (allRaces.length === 0) {
        console.error("Scraping finished, but no upcoming race data was found. Falling back to static data.");
        return getStaticRaceData();
    }
    
    return allRaces.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('An unexpected error occurred during scraping:', error);
    // In case of any unexpected error, return static data to prevent app crash
    return getStaticRaceData();
  }
};
