"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: string): TimeLeft => {
  const targetTime = new Date(targetDate);
  targetTime.setHours(targetTime.getHours() + 3);

  const difference = +targetTime - +new Date();
  let timeLeft: TimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};


const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetDate));
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const timerComponents = [
    { label: 'Días', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Min', value: timeLeft.minutes },
    { label: 'Seg', value: timeLeft.seconds },
  ];
  
  const allZero = Object.values(timeLeft).every(value => value === 0);

  if (allZero) {
    return (
      <div className="text-center text-lg font-bold text-primary animate-pulse p-4 bg-muted/20 rounded-lg">
        ¡La carrera ha comenzado!
      </div>
    );
  }


  return (
    <div className="grid grid-cols-4 gap-2 text-center my-4">
      {timerComponents.map((component, index) => (
        <div key={index} className="bg-transparent p-2 rounded-lg">
          <div className="text-4xl font-black text-primary tracking-tighter tabular-nums">
            {String(component.value).padStart(2, '0')}
          </div>
          <div className="text-xs text-card-foreground/80 uppercase tracking-wider">
            {component.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export const CalculatedDate: React.FC<CountdownTimerProps> = ({ targetDate }) => {
    const [startDate, setStartDate] = useState<Date | null>(null);

    useEffect(() => {
        const targetTime = new Date(targetDate);
        targetTime.setHours(targetTime.getHours() + 3);
        setStartDate(targetTime);
    }, [targetDate]);

    if (!startDate) {
        return <span>Calculando fecha...</span>;
    }

    const formattedTime = startDate.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    return (
        <span>
            Inicia: {startDate.toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })} {formattedTime}hs
        </span>
    );
};

export default CountdownTimer;
