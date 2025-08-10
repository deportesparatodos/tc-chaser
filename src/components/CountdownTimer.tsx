'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';

interface CountdownTimerProps {
  targetDate: string;
  isLive: boolean;
  liveUrl?: string;
  eventName?: string; // Prop para el nombre del evento
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: string): TimeLeft | null => {
  const difference = +new Date(targetDate) - +new Date();
  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return null;
};

export default function CountdownTimer({ targetDate, isLive, liveUrl, eventName }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearTimeout(timer);
  });

  if (isLive) {
    return (
      <a href={liveUrl} target="_blank" rel="noopener noreferrer" className='w-full'>
        <Button className="w-full bg-red-600 hover:bg-red-700 text-white animate-pulse text-lg py-6">
          EN VIVO
        </Button>
      </a>
    );
  }

  if (!timeLeft) {
    return <div className="text-center text-xl font-bold">El evento ha comenzado o finalizado.</div>;
  }

  return (
    <div>
      {eventName && <p className="text-center text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Próximo: <strong>{eventName}</strong></p>}
      <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit} className="bg-gray-100 dark:bg-gray-800 p-2 md:p-4 rounded-lg">
            <div className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white">{String(value).padStart(2, '0')}</div>
            <div className="text-xs md:text-sm uppercase text-gray-500 dark:text-gray-400">{unit}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
