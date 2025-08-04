"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

const calculateTimeLeft = (targetDate: string) => {
  // Add 3 hours to the target date
  const targetTime = new Date(targetDate);
  targetTime.setHours(targetTime.getHours() + 3);

  const difference = +targetTime - +new Date();
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
    { label: 'D', value: timeLeft.days },
    { label: 'H', value: timeLeft.hours },
    { label: 'M', value: timeLeft.minutes },
    { label: 'S', value: timeLeft.seconds },
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

export default CountdownTimer;
