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

async function getNextRaceForCategory(category: keyof typeof categoryMappings): Promise<RaceEvent | null> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const url = `https://actc.org.ar/${category}/calendario.html`;

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });

    await page.evaluate(() => {
        const yearSelector = document.querySelector('#year');
        if (yearSelector) {
            const currentYear = new Date().getFullYear().toString();
            // @ts-ignore
            if (yearSelector.value !== currentYear) {
                 // @ts-ignore
                yearSelector.value = currentYear;
                const event = new Event('change', { bubbles: true });
                yearSelector.dispatchEvent(event);
            }
        }
    });

    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    const raceData = await page.evaluate((category) => {
      const raceElements = Array.from(document.querySelectorAll('.calendario-temporada .info-race'));
      const now = new Date();
      const currentYear = now.getFullYear();
      const monthMap: { [key: string]: number } = {
        ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
        jul: 6, ago: 7, set: 8, oct: 9, nov: 10, dic: 11
      };

      for (const el of raceElements) {
        const dateEl = el.querySelector('.date');
        const circuitEl = el.querySelector('.hd h2');
        const locationEl = el.querySelector('.hd p');
        const imageEl = el.querySelector<HTMLImageElement>('.cont-circuit img');

        if (dateEl && circuitEl && locationEl && imageEl) {
          const day = parseInt(dateEl.querySelector('span')?.textContent?.trim() || '0', 10);
          const monthStr = (dateEl.textContent?.replace(String(day), '').trim().toLowerCase() || '').substring(0, 3);
          const month = monthMap[monthStr as keyof typeof monthMap];
          
          if (day && month !== undefined) {
             const raceDate = new Date(Date.UTC(currentYear, month, day, 16, 30, 0)); // 13:30 a. m. en Argentina (UTC-3)
            
            if (raceDate >= now) {
              const circuitImage = imageEl.dataset.original;
              return {
                circuitName: circuitEl.textContent?.trim() || '',
                location: locationEl.textContent?.trim() || '',
                date: raceDate.toISOString(),
                circuitImage: circuitImage ? `https://actc.org.ar${circuitImage}` : 'https://placehold.co/600x400.png',
                schedule: [], // Schedule is not available on this page
                circuitImageHint: 'race track',
              };
            }
          }
        }
      }
      return null;
    }, category as string);

    return raceData ? { ...categoryMappings[category], ...raceData } as RaceEvent : null;

  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  } finally {
    await browser.close();
  }
}

export const getRaceData = async (): Promise<RaceEvent[]> => {
    const categories = Object.keys(categoryMappings) as (keyof typeof categoryMappings)[];
    const raceDataPromises = categories.map(getNextRaceForCategory);
    const results = await Promise.all(raceDataPromises);
    return results.filter((race): race is RaceEvent => race !== null);
};
