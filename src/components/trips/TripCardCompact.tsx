import { Link } from 'react-router-dom';
import type { Trip } from '../../types';
import { Calendar, MapPin, Users } from 'lucide-react';
import { formatDate, daysUntil, currency } from '../../lib/utils';

export default function TripCardCompact({ trip }: { trip: Trip }) {
  const avail = trip.total_seats - (trip.blocked_seats?.length || 0);
  const days = daysUntil(trip.departure_date);

  return (
    <Link to={`/trip/${trip.id}`} className="group flex w-[240px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-[260px]">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img src={trip.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'} alt={trip.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-lg bg-white/95 px-2 py-0.5 text-[11px] font-bold text-slate-800 backdrop-blur-sm"><MapPin className="h-3 w-3 text-emerald-500" />{trip.departure_city}</span>
        {days > 0 && days <= 15 && <span className="absolute right-2.5 top-2.5 rounded-lg bg-amber-500 px-2 py-0.5 text-[11px] font-extrabold text-white">🔥 {days}d</span>}
        <span className="absolute bottom-2.5 left-2.5 rounded-md bg-slate-900/75 px-2 py-0.5 text-[10px] font-semibold text-white">{trip.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-3.5">
        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" />{formatDate(trip.departure_date)}</span>
          <span className="rounded-full bg-slate-50 px-2 py-0.5 font-semibold">{trip.duration_text}</span>
        </div>
        <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-emerald-600">{trip.title}</h3>
        <div className="mt-auto pt-3">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500"><Users className="h-3.5 w-3.5 text-slate-400" /><span className={avail <= 5 ? 'text-rose-500 font-bold' : ''}>{avail} lugares</span></div>
          <div className="mt-2 flex items-end justify-between border-t border-slate-100 pt-2.5">
            <div><span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Desde</span><span className="text-base font-black text-slate-900">${currency(trip.price)}</span></div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">Ver</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
