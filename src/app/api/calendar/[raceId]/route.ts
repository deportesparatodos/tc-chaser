
// /src/app/api/calendar/[raceId]/route.ts
import { NextResponse } from 'next/server';
import { getRaceData } from '@/lib/data';

function formatDateForICS(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function getNextSunday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0) ? 0 : (7 - day); // if it's already Sunday, diff is 0
  date.setDate(date.getDate() + diff);
  date.setHours(23, 59, 59, 999);
  return date;
}

export async function GET(
  request: Request,
  { params }: { params: { raceId: string } }
) {
  const raceId = params.raceId;

  if (!raceId) {
    return new NextResponse('Race ID is required', { status: 400 });
  }

  try {
    const races = await getRaceData();
    const race = races.find(r => r.id === raceId);

    if (!race) {
      return new NextResponse('Race not found', { status: 404 });
    }

    const startDate = new Date(race.date);
    let endDate : Date;
    let vEvent: string;

    const summary = `${race.categoryShortName}: ${race.circuitName}`;
    const description = `Carrera de ${race.category} en el autódromo ${race.circuitName}, ubicado en ${race.location}.`;
    const uid = `${race.id}-${startDate.getFullYear()}@tc-chaser.com`;
    const dtstamp = formatDateForICS(new Date());

    if (race.id === 'tc2000') {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endDay = getNextSunday(new Date(startOfDay)); // Pass a new date object
      endDay.setDate(endDay.getDate() + 1);
      
      const dtstart = startOfDay.toISOString().split('T')[0].replace(/-/g, '');
      const dtend = endDay.toISOString().split('T')[0].replace(/-/g, '');
      
      vEvent = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${race.circuitName}, ${race.location}`,
        `DTSTART;VALUE=DATE:${dtstart}`,
        `DTEND;VALUE=DATE:${dtend}`,
        'END:VEVENT'
      ].join('\r\n');
    } else {
      const dtstart = formatDateForICS(startDate);
      endDate = getNextSunday(startDate);
      const dtend = formatDateForICS(endDate);
      
      vEvent = [
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${dtstamp}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${race.circuitName}, ${race.location}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        'END:VEVENT'
      ].join('\r\n');
    }


    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TCChaser//NONSGML v1.0//EN',
      `X-WR-CALNAME:${race.categoryShortName} Calendario`,
      'X-WR-TIMEZONE:America/Argentina/Buenos_Aires',
      vEvent,
      'END:VCALENDAR'
    ].join('\r\n');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${race.id}.ics"`,
      },
    });

  } catch (error) {
    console.error('Failed to generate calendar file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
