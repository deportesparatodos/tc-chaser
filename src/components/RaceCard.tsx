import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
    Icon,
    category,
    categoryFullName,
    circuitName,
    location,
    date,
    schedule,
    circuitImage,
    circuitImageHint,
  } = race;

  const raceDate = new Date(date);

  return (
    <Card className="w-full max-w-sm overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-card group">
      <CardHeader className="flex flex-row items-center gap-4 p-4 bg-primary text-primary-foreground">
        <Icon className="w-10 h-10" />
        <div>
          <CardTitle className="text-2xl font-bold">{category}</CardTitle>
          <CardDescription className="text-primary-foreground/80">
            {categoryFullName}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative w-full h-48">
          <Image
            src={circuitImage}
            alt={`Circuito ${circuitName}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={circuitImageHint}
          />
        </div>
        <div className="p-4 space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-semibold">{circuitName}</h3>
            <p className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {location}
            </p>
          </div>
          
          <CountdownTimer targetDate={date} />
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base font-medium">
                Ver Cronograma
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                   <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{raceDate.toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                   </div>
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
        </div>
      </CardContent>
    </Card>
  );
}
