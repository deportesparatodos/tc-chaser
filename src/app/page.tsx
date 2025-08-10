import RaceCard from '@/components/RaceCard';
import { RaceData } from '@/types';
import { races, getEventData } from '@/lib/data';
import { FooterActions } from '@/components/FooterActions';
import { Logo } from '@/components/ui/logo';

// Función para obtener los datos de todas las carreras en el servidor
async function getEvents(): Promise<RaceData[]> {
  try {
    const allRacesData = await Promise.all(
      races.map(race => getEventData(race.id))
    );
    // Filtramos los resultados nulos por si alguna categoría falla
    return allRacesData.filter((data): data is RaceData => data !== null);
  } catch (error) {
    console.error('Error al cargar los eventos en el servidor:', error);
    return [];
  }
}

export default async function Home() {
  const events = await getEvents();

  // Creamos un mapa para buscar fácilmente los datos de cada carrera por su ID
  const eventsMap = new Map(events.map(event => [event.id, event]));

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="container mx-auto p-4 flex justify-center items-center flex-col">
          <Logo/>
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 dark:text-gray-200 mb-2">
            TC-Chaser
          </h1>
          <p className='text-center text-muted-foreground'>Toda la info del Turismo Carretera, en un solo lugar.</p>
      </header>
      
      <main className="container mx-auto p-4 flex-grow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {races.map((race) => {
            const eventData = eventsMap.get(race.id);
            return <RaceCard key={race.id} race={race} initialData={eventData} />;
          })}
        </div>
      </main>

      <footer className="w-full mt-8">
          <FooterActions/>
      </footer>
    </div>
  );
}
