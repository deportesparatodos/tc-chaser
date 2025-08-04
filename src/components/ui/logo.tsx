import { Flag } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="bg-primary p-2 rounded-full">
        <Flag className="w-6 h-6 text-primary-foreground" />
      </div>
      <h1 className="text-3xl font-black tracking-tighter text-foreground">
        TC <span className="text-primary">Chaser</span>
      </h1>
    </div>
  );
}
