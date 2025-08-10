'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Race, RaceData } from '@/types';
import CountdownTimer from './CountdownTimer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface RaceCardProps {
  race: Race;
  initialData?: RaceData;
}

export default function RaceCard({ race, initialData }: RaceCardProps) {
  // Usamos los datos iniciales cargados desde el servidor
  const [raceData] = useState<RaceData | undefined>(initialData);

  const renderContent = () => {
    if (!raceData) {
      return <p className="text-center text-muted-foreground">No se pudo cargar la información para esta categoría.</p>;
    }

    // Si no hay fecha para el contador, mostramos un mensaje
    if (!raceData.countdownTarget) {
      return <p className="text-center text-lg font-semibold">{raceData.nextEventName || 'No hay eventos programados.'}</p>;
    }

    return (
      <>
        <CountdownTimer 
          targetDate={raceData.countdownTarget} 
          eventName={raceData.nextEventName}
          isLive={raceData.isLive}
          liveUrl={raceData.liveUrl}
        />
        {/* Mostramos el acordeón solo si hay un calendario con eventos */}
        {raceData.hasCalendar && raceData.schedule && raceData.schedule.length > 0 && (
          <Accordion type="single" collapsible className="w-full mt-4">
            <AccordionItem value="item-1">
              <AccordionTrigger>Ver cronograma</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  {raceData.schedule.map((event, index) => (
                    <li key={index} className={`flex items-center justify-between p-2 rounded-md ${new Date(event.fullDateTime) < new Date() ? 'bg-gray-100 dark:bg-gray-800 opacity-60' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                      <div className="flex flex-col">
                        <span className="font-semibold">{event.name}</span>
                        <span className="text-muted-foreground">{event.day}, {event.time}hs</span>
                      </div>
                      <a 
                        href={event.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`font-medium text-xs px-2 py-1 rounded-full ${event.status === 'Finalizada' ? 'text-green-700 bg-green-100 hover:bg-green-200' : 'text-blue-700 bg-blue-100 hover:bg-blue-200'}`}
                        // Deshabilitar el click si no hay link
                        style={{ pointerEvents: event.link ? 'auto' : 'none' }}
                      >
                        {event.status}
                      </a>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
      </>
    );
  };

  return (
    <Card className="flex flex-col border-2 hover:border-blue-500 transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={race.logo} alt={race.name} className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold">{race.name}</span>
          </div>
          <a href={race.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
            Sitio Oficial
          </a>
        </CardTitle>
        {raceData && (raceData.raceName || raceData.circuit) && (
            <p className="text-sm text-muted-foreground pt-2 h-10">
                {raceData.raceName}
                {raceData.circuit && ` - ${raceData.circuit}`}
            </p>
        )}
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-center">
        {renderContent()}
      </CardContent>
    </Card>
  );
}
