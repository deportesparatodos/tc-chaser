// /src/app/api/events/route.ts
import { NextResponse } from 'next/server';
import { getRaceData } from '@/lib/data';

function getNextSunday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  // if it's sunday, add 7 days to get the next one
  const diff = day === 0 ? 7 : 7 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(23, 59, 59, 999);
  return date;
}

export async function GET() {
  try {
    const races = await getRaceData();

    if (!races || races.length === 0) {
      return new NextResponse(JSON.stringify({ error: 'No races found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const events = races.map(race => {
      const startDate = new Date(race.date);
      startDate.setHours(startDate.getHours() + 3);
      const endDate = getNextSunday(startDate);

      return {
        event_time_and_day: startDate.toISOString(),
        event_title: `${race.category} - ${race.circuitName}`,
        end_date: endDate.toISOString(),
        cover_image: race.circuitImage,
      };
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to generate events data:', error);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
