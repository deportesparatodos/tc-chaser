import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Calendar, Clock, MapPin } from 'lucide-react';

import type { RaceEvent } from '@/types';
import CountdownTimer from './CountdownTimer';

interface RaceCardProps {
  race: RaceEvent;
}

export function RaceCard({ race }: RaceCardProps) {
  const {
    category,
    circuitName,
    location,
    date,
    schedule,
    circuitImage,
    circuitImageHint,
  } = race;

  const raceDate = new Date(date);
  raceDate.setHours(raceDate.getHours() + 3);

  // Extract province from location
  const province = location.split(',')[0] || location;


  return (
    <Card className="w-full max-w-2xl overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-card group">
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/3 h-64 md:h-auto">
          <Image
            src={circuitImage}
            alt={`Circuito ${circuitName}`}
            fill
            className="object-cover"
            data-ai-hint={circuitImageHint}
          />
        </div>
        
        <CardContent className="p-4 md:p-6 flex-1">
            <h3 className="text-xl font-bold text-card-foreground">{circuitName}</h3>
            <p className="font-semibold text-primary mb-2">{province}</p>

            <CountdownTimer targetDate={date} />
          
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-base font-medium">
                        <h4 className="text-lg font-bold text-card-foreground">{category}</h4>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                        {schedule.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <span>{item.day}: {item.activity}</span>
                            </div>
                            <span className="font-mono font-semibold text-primary">{item.time} hs</span>
                            </div>
                        ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
             <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mt-4">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Fecha de inicio: {raceDate.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} hs</span>
           </div>
        </CardContent>
      </div>
    </Card>
  );
}
