import { Link } from 'react-router-dom';
import type { Trip } from '../../types';
import { Calendar, MapPin, Users, ShieldCheck } from 'lucide-react';
import { formatDate, daysUntil, currency } from '../../lib/utils';

export default function TripCard({ trip }: { trip: Trip }) {
  const avail = trip.total_seats - (trip.blocked_seats?.length || 0);
  const days = daysUntil(trip.departure_date);

  return (
    <Link to={`/trip/${trip.id}`} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-emerald-100/20">
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img src={trip.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'} alt={trip.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-x-3 top-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-sm"><MapPin className="h-3.5 w-3.5 text-emerald-500" />{trip.departure_city}</span>
          {days > 0 && days <= 15 && <span className="rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">🔥 {days}d</span>}
        </div>
        <span className="absolute bottom-3 left-3 rounded-md bg-slate-900/80 px-2 py-1 text-xs font-semibold text-white">{trip.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-slate-400" />{formatDate(trip.departure_date)}</span>
          <span className="rounded-full bg-slate-50 px-2.5 py-0.5 font-semibold">{trip.duration_text}</span>
        </div>
        <h3 className="mt-3 text-lg font-bold text-slate-950 line-clamp-2 group-hover:text-emerald-600 transition-colors">{trip.title}</h3>
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-slate-700"><Users className="h-4 w-4 text-slate-400" />{avail} lugares</span>
            <span className={`font-bold ${avail <= 5 ? 'text-rose-500' : 'text-slate-900'}`}>{avail}/{trip.total_seats}</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${avail <= 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${(avail / trip.total_seats) * 100}%` }} /></div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Precio por persona</span>
            <span className="text-xl font-black text-slate-900">${currency(trip.price)} <span className="text-xs font-semibold text-slate-500">{trip.currency}</span></span>
          </div>
          <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">Ver</span>
        </div>
        {trip.agency && (
          <div className="mt-3 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] font-medium text-slate-500">
            <span className="truncate">{trip.agency.name}</span>
            {trip.agency.is_verified && <span className="flex shrink-0 items-center gap-1 font-bold text-emerald-600"><ShieldCheck className="h-3.5 w-3.5" />Verificado</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
