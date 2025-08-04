import { getRaceData } from '@/lib/data';
import { RaceCard } from '@/components/RaceCard';
import { Logo } from '@/components/ui/logo';

export default async function Home() {
  const raceData = await getRaceData();
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <header className="py-8 px-4 text-center border-b bg-card/50">
         <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
            <Logo />
            <p className="text-lg text-muted-foreground max-w-2xl">
                Toda la información de las próximas carreras de Turismo Carretera en un solo lugar.
            </p>
         </div>
      </header>
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
         {raceData.length > 0 ? (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {raceData.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </section>
          ) : (
             <div className="text-center py-16">
                <h2 className="text-2xl font-bold mb-4">No se pudieron cargar los datos de las carreras.</h2>
                <p className="text-muted-foreground">Por favor, intente de nuevo más tarde.</p>
             </div>
          )}
      </main>
       <footer className="text-center py-6 px-4 border-t text-muted-foreground text-sm">
        <p>Desarrollado con ♥ para los fanáticos del automovilismo.</p>
        <p>TC Chaser &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
