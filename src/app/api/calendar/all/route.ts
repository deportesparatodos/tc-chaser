
// /src/app/api/calendar/all/route.ts
import { NextResponse } from 'next/server';
import { getRaceData } from '@/lib/data';

function formatDateForICS(date: Date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function getNextSunday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(23, 59, 59, 999);
  return date;
}

export async function GET() {
  try {
    const races = await getRaceData();

    if (!races || races.length === 0) {
      return new NextResponse('No races found', { status: 404 });
    }

    const vEvents = races.map(race => {
      // Create date object from UTC string and then adjust to local time for calendar
      const startDate = new Date(race.date);
      startDate.setHours(startDate.getHours() + 3);

      let vEvent: string;
      const summary = `${race.categoryShortName}: ${race.circuitName}`;
      const description = `Carrera de ${race.category} en el autódromo ${race.circuitName}, ubicado en ${race.location}.`;
      const uid = `${race.id}-${startDate.getFullYear()}@tc-chaser.com`;
      const dtstamp = formatDateForICS(new Date());

      if (race.id === 'tc2000') {
          const endDay = getNextSunday(new Date(startDate));
          
          const dtstart = startDate.toISOString().split('T')[0].replace(/-/g, '');
          // The end date for an all-day event should be the day *after* it ends.
          endDay.setDate(endDay.getDate() + 1);
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
        const endDate = getNextSunday(new Date(startDate));
        const dtstart = formatDateForICS(startDate);
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
      return vEvent;
    }).join('\r\n');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TCChaser//NONSGML v1.0//EN',
      `X-WR-CALNAME:Calendario de Carreras Completo`,
      'X-WR-TIMEZONE:America/Argentina/Buenos_Aires',
      vEvents,
      'END:VCALENDAR'
    ].join('\r\n');

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="all_races.ics"`,
      },
    });

  } catch (error) {
    console.error('Failed to generate all-races calendar file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
