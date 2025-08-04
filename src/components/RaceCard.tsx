import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';

import type { RaceEvent } from '@/types';
import CountdownTimer, { CalculatedDate } from './CountdownTimer';

interface RaceCardProps {
  race: RaceEvent;
}

export function RaceCard({ race }: RaceCardProps) {
  const {
    category,
    circuitName,
    location,
    date,
    circuitImage,
    circuitImageHint,
    calendarUrl,
  } = race;

  const province = location.split(',')[0] || location;

  return (
    <Card className="w-full max-w-2xl overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-card group">
       <a href={calendarUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
        <h3 className="text-xl font-bold text-card-foreground text-center py-4 bg-card-foreground/5">{category}</h3>
      </a>
      <div className="flex flex-col md:flex-row">
        <div className="relative w-full md:w-1/3 h-64 md:h-auto bg-white flex items-center justify-center">
          <Image
            src={circuitImage}
            alt={`Circuito ${circuitName}`}
            fill
            className="object-contain p-2"
            data-ai-hint={circuitImageHint}
          />
        </div>
        
        <CardContent className="p-4 md:p-6 flex-1 flex flex-col justify-center">
            <h4 className="text-xl font-bold text-card-foreground">{circuitName}</h4>
            <p className="font-semibold text-primary mb-2">{province}</p>

            <CountdownTimer targetDate={date} />
          
           <div className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground mt-4">
                <CalculatedDate targetDate={date} />
           </div>
        </CardContent>
      </div>
    </Card>
  );
}
