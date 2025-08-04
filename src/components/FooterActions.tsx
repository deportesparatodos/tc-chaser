"use client";

import { CalendarIcon } from 'lucide-react';

export function FooterActions() {
    const handleAddToCalendar = () => {
        if (typeof window !== 'undefined') {
          const calendarUrl = `webcal://${window.location.host}/api/calendar/all`;
          window.location.href = calendarUrl;
        }
    };

    return (
        <button 
            onClick={handleAddToCalendar}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Añadir Todas las Categorías al Calendario
        </button>
    );
}
