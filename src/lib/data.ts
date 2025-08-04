import { CarFront, Truck } from 'lucide-react';
import type { RaceEvent } from '@/types';
import puppeteer from 'puppeteer';

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

const monthMap: { [key: string]: number } = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, set: 8, oct: 9, nov: 10, dic: 11
};

async function getRacesForCategory(category: keyof typeof categoryMappings): Promise<RaceEvent[]> {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    });
    const page = await browser.newPage();
    const url = `https://actc.org.ar/${category}/calendario.html`;

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        const currentYear = new Date().getFullYear();
        
        await page.evaluate((year) => {
            const yearSelector = document.querySelector('#year');
            if (yearSelector) {
                // @ts-ignore
                if (yearSelector.value !== year.toString()) {
                    // @ts-ignore
                    yearSelector.value = year.toString();
                    const event = new Event('change', { bubbles: true });
                    yearSelector.dispatchEvent(event);
                }
            }
        }, currentYear);

        await page.waitForSelector('.calendario-temporada .info-race', { timeout: 10000 });

        const raceData = await page.evaluate((currentYear, category, monthMap) => {
            const raceElements = Array.from(document.querySelectorAll('.calendario-temporada .info-race'));
            const races = [];

            for (const el of raceElements) {
                const dateEl = el.querySelector('.date');
                const circuitEl = el.querySelector('.hd h2');
                const locationEl = el.querySelector('.hd p');
                const imageEl = el.querySelector<HTMLImageElement>('.cont-circuit img');

                if (dateEl && circuitEl && locationEl && imageEl) {
                    const dayText = dateEl.querySelector('span')?.textContent?.trim();
                    const day = dayText ? parseInt(dayText, 10) : NaN;
                    
                    const monthStr = (dateEl.textContent?.replace(dayText || '', '').trim().toLowerCase() || '').substring(0, 3);
                    const month = monthMap[monthStr as keyof typeof monthMap];

                    if (!isNaN(day) && month !== undefined) {
                        const raceDate = new Date(Date.UTC(currentYear, month, day, 16, 30, 0));
                        
                        const circuitImage = imageEl.dataset.original || imageEl.src;
                        races.push({
                            circuitName: circuitEl.textContent?.trim() || '',
                            location: locationEl.textContent?.trim() || '',
                            date: raceDate.toISOString(),
                            circuitImage: circuitImage ? `https://actc.org.ar${circuitImage}` : 'https://placehold.co/600x400.png',
                            schedule: [],
                            circuitImageHint: 'race track',
                        });
                    }
                }
            }
            return races;
        }, currentYear, category as string, monthMap);

        const categoryInfo = categoryMappings[category];
        return raceData.map(race => ({ ...categoryInfo, ...race })) as RaceEvent[];

    } catch (error) {
        console.error(`Error scraping ${url}:`, error);
        return []; // Return empty array on error for this category
    } finally {
        await browser.close();
    }
}

export const getRaceData = async (): Promise<RaceEvent[]> => {
    const categories = Object.keys(categoryMappings) as (keyof typeof categoryMappings)[];
    let allRaces: RaceEvent[] = [];

    for(const category of categories) {
        const races = await getRacesForCategory(category);
        const now = new Date();
        const nextRace = races.find(race => new Date(race.date) >= now);
        if (nextRace) {
            allRaces.push(nextRace);
        }
    }
    
    // Fallback to static data if scraping fails for all categories
    if (allRaces.length === 0) {
        console.warn("Scraping returned no upcoming races, falling back to static data.");
        return getStaticRaceData();
    }

    return allRaces;
};

// Static data fallback
const getStaticRaceData = (): RaceEvent[] => {
  const staticDate = new Date();
  staticDate.setDate(staticDate.getDate() + 7);

  return Object.keys(categoryMappings).map(key => {
    const cat = categoryMappings[key as keyof typeof categoryMappings];
    return {
      id: cat.id!,
      category: cat.category!,
      categoryFullName: cat.categoryFullName!,
      Icon: cat.Icon!,
      circuitName: 'Autódromo Placeholder',
      location: 'Ciudad Genérica',
      date: staticDate.toISOString(),
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