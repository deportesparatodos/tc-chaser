"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

const calculateTimeLeft = (targetDate: string) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

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
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Set initial value on client mount to avoid hydration mismatch
    setTimeLeft(calculateTimeLeft(targetDate));

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const timerComponents = [
    { label: 'Días', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Minutos', value: timeLeft.minutes },
    { label: 'Segundos', value: timeLeft.seconds },
  ];

  const allZero = Object.values(timeLeft).every(value => value === 0);

  if (allZero) {
    return (
      <div className="text-center text-lg font-bold text-primary animate-pulse p-4 bg-muted rounded-lg">
        ¡La carrera ha comenzado!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 md:gap-4 text-center">
      {timerComponents.map((component, index) => (
        <div key={index} className="bg-muted p-2 md:p-3 rounded-lg shadow-inner transition-transform duration-300 hover:scale-105">
          <div className="text-2xl md:text-3xl font-black text-primary tracking-tighter tabular-nums">
            {String(component.value).padStart(2, '0')}
          </div>
          <div className="text-xs text-muted-foreground uppercase tracking-wider">
            {component.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
