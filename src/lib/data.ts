import * as cheerio from 'cheerio';
import { Race, RaceData, ScheduleEvent } from '@/types';
import { zonedTimeToUtc } from 'date-fns-tz';

// La lista de carreras permanece igual
export const races: Race[] = [
    { id: 'tc', name: 'Turismo Carretera', logo: '/tc.png', url: 'https://actc.org.ar/tc/index.html' },
    { id: 'tcp', name: 'TC Pista', logo: '/tcp.png', url: 'https://actc.org.ar/tcp/index.html' },
    { id: 'tcm', name: 'TC Mouras', logo: '/tcm.png', url: 'https://actc.org.ar/tcm/index.html' },
    { id: 'tcpm', name: 'TC Pista Mouras', logo: '/tcpm.png', url: 'https://actc.org.ar/tcpm/index.html' },
    { id: 'tcpk', name: 'TC Pick Up', logo: '/tcpk.png', url: 'https://actc.org.ar/tcpk/index.html' },
    { id: 'tcppk', name: 'TC Pista Pick Up', logo: '/tcppk.png', url: 'https://actc.org.ar/tcppk/index.html' },
];

// Reemplazamos la función getEventData con esta nueva lógica
export async function getEventData(raceId: string): Promise<RaceData | null> {
    const url = `https://actc.org.ar/${raceId}/index.html`;
    const timeZone = 'America/Argentina/Buenos_Aires';

    try {
        const response = await fetch(url, { next: { revalidate: 60 } }); // Cache de 60 segundos
        if (!response.ok) {
            console.error(`Error al cargar ${url}: ${response.statusText}`);
            return null;
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        // Extraer información general de la carrera
        const raceName = $('.venue h2').first().text().trim();
        const circuit = $('ul.menu-race-feature a.circuito').text().trim();
        const category = $('.volanta .category').first().text().trim() || raceId.toUpperCase();

        const isLive = $('#carrera-envivo a').length > 0 && $('#carrera-envivo a').attr('href') !== '/envivo';
        const liveUrl = isLive ? 'https://actc.org.ar' + $('#carrera-envivo a').attr('href') : undefined;

        const calendarDiv = $('#calendario');

        // Lógica para extraer datos del calendario si existe
        if (calendarDiv.length > 0 && calendarDiv.find('.sep-eta').length > 0) {
            const schedule: ScheduleEvent[] = [];
            const raceDateStr = $('.volanta .date').first().text().trim(); // Ej: 10.08.25
            
            if (!raceDateStr) {
                // Si no hay fecha en la cabecera, no podemos procesar el calendario
                return getFallbackData($, raceId, raceName, circuit, category, isLive, liveUrl);
            }

            const [dayOfMonth, month, yearShort] = raceDateStr.split('.').map(Number);
            const year = 2000 + yearShort;
            // La fecha principal suele ser la del Domingo
            const mainRaceDate = new Date(Date.UTC(year, month - 1, dayOfMonth));

            calendarDiv.find('.date').each((i, dayElem) => {
                const dayName = $(dayElem).find('.hd .dia').text().trim();
                let eventDateBase = new Date(mainRaceDate);

                // Ajustamos la fecha para Sábado o Viernes
                if (dayName.toLowerCase().includes('sabado') || dayName.toLowerCase().includes('sábado')) {
                    eventDateBase.setUTCDate(mainRaceDate.getUTCDate() - 1);
                } else if (dayName.toLowerCase().includes('viernes')) {
                    eventDateBase.setUTCDate(mainRaceDate.getUTCDate() - 2);
                }

                $(dayElem).find('.sep-eta').each((j, eventElem) => {
                    const time = $(eventElem).find('b').text().trim();
                    const name = $(eventElem).find('span').text().trim();
                    const link = $(eventElem).find('a').attr('href');
                    const statusText = $(eventElem).find('a').text().trim();

                    if (time && name) {
                        const [hours, minutes] = time.split(':').map(Number);
                        let eventDate = new Date(eventDateBase);
                        eventDate.setUTCHours(hours, minutes, 0, 0);
                        
                        // La hora de la web está en zona horaria de Argentina. La convertimos a UTC.
                        const zonedEventDate = zonedTimeToUtc(eventDate, timeZone);

                        schedule.push({
                            day: dayName,
                            time,
                            name,
                            fullDateTime: zonedEventDate.toISOString(),
                            status: statusText.includes('Resultados') ? 'Finalizada' : 'Próxima',
                            link: link ? `https://actc.org.ar${link}` : undefined,
                        });
                    }
                });
            });

            const now = new Date();
            // Buscamos el próximo evento que aún no ha sucedido
            const upcomingEvents = schedule.filter(e => new Date(e.fullDateTime) > now);
            const nextEvent = upcomingEvents.length > 0 ? upcomingEvents[0] : null;

            return {
                id: raceId,
                category,
                raceName: raceName || category,
                circuit,
                countdownTarget: nextEvent ? nextEvent.fullDateTime : (schedule.length > 0 ? schedule[schedule.length - 1].fullDateTime : null),
                nextEventName: nextEvent ? nextEvent.name : 'Evento finalizado',
                schedule,
                hasCalendar: true,
                isLive: isLive && !nextEvent, // Está en vivo si hay link y no hay eventos próximos
                liveUrl,
            };
        } else {
           // Si no hay calendario, usamos la lógica de fallback
           return getFallbackData($, raceId, raceName, circuit, category, isLive, liveUrl);
        }
    } catch (error) {
        console.error(`Error al procesar datos para ${raceId}:`, error);
        return null;
    }
}

// Función de fallback si no se encuentra el calendario
function getFallbackData($: cheerio.CheerioAPI, raceId: string, raceName: string, circuit: string, category: string, isLive: boolean, liveUrl: string | undefined): RaceData | null {
    // Intentamos obtener el estado de la carrera si no hay calendario
    const raceStatus = $('.en-carrera .venue .standings').first().text().trim();

    // Aquí podrías agregar la lógica para leer el contador si lo encuentras en el HTML
    // Por ahora, devolvemos que no hay información disponible.
    return {
        id: raceId,
        category,
        raceName,
        circuit,
        countdownTarget: null, // No hay cuenta regresiva
        nextEventName: raceStatus || 'Información no disponible',
        hasCalendar: false,
        isLive,
        liveUrl,
        schedule: []
    };
}
