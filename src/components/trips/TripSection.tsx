import type { Trip } from '../../types';
import TripCardCompact from './TripCardCompact';

interface Props { title: string; subtitle?: string; emoji?: string; trips: Trip[]; }

export default function TripSection({ title, subtitle, emoji, trips }: Props) {
  if (trips.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-slate-900 sm:text-xl">{emoji && <span>{emoji}</span>}{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <span className="shrink-0 text-xs font-semibold text-slate-400">{trips.length} {trips.length === 1 ? 'viaje' : 'viajes'}</span>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {trips.map(t => <TripCardCompact key={t.id} trip={t} />)}
      </div>
    </section>
  );
}
