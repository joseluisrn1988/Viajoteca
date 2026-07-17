import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTrips } from '../../contexts/TripContext';
import type { Trip, Booking, Review } from '../../types';
import { Plus, Trash2, Users, DollarSign, MapPin, Star, X } from 'lucide-react';
import { formatDate, currency } from '../../lib/utils';
import LoadingSpinner from '../shared/LoadingSpinner';
import toast from 'react-hot-toast';

export default function AgencyDashboard() {
  const { agency } = useAuth();
  const { fetchAgencyTrips, deleteTrip, toggleSeat, fetchTripBookings, fetchAgencyReviews } = useTrips();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [seatTrip, setSeatTrip] = useState<Trip | null>(null);

  useEffect(() => { if (agency) load(); }, [agency]);

  const load = async () => {
    if (!agency) return;
    setLoading(true);
    const t = await fetchAgencyTrips(agency.id);
    setTrips(t);
    const r = await fetchAgencyReviews(agency.id);
    setReviews(r);
    // Load bookings for all trips
    const allBookings: Booking[] = [];
    for (const trip of t) { const b = await fetchTripBookings(trip.id); allBookings.push(...b); }
    setBookings(allBookings);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este viaje?')) return;
    if (await deleteTrip(id)) { setTrips(trips.filter(t => t.id !== id)); }
  };

  const handleToggleSeat = async (tripId: string, seat: number) => {
    if (await toggleSeat(tripId, seat)) {
      setSeatTrip(prev => {
        if (!prev) return null;
        const bs = prev.blocked_seats.includes(seat) ? prev.blocked_seats.filter(s => s !== seat) : [...prev.blocked_seats, seat];
        return { ...prev, blocked_seats: bs };
      });
      toast.success(`Asiento ${seat} actualizado`);
    }
  };

  const totalRevenue = trips.reduce((a, t) => a + (t.blocked_seats?.length || 0) * t.price, 0);
  const totalSold = trips.reduce((a, t) => a + (t.blocked_seats?.length || 0), 0);

  if (loading) return <LoadingSpinner text="Cargando tu panel..." />;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div><h1 className="text-2xl font-black text-slate-900">Panel de {agency?.name || 'Agencia'}</h1><p className="mt-1 text-sm text-slate-500">Gestiona tus viajes, reservas y reseñas.</p></div>
        <Link to="/agency/trips/new" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"><Plus className="h-4 w-4" />Crear Viaje</Link>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><DollarSign className="h-6 w-6 text-emerald-600 mb-2" /><p className="text-xs font-bold text-slate-400 uppercase">Ingresos Estimados</p><p className="text-xl font-black text-slate-900">${currency(totalRevenue)}</p></div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><MapPin className="h-6 w-6 text-emerald-600 mb-2" /><p className="text-xs font-bold text-slate-400 uppercase">Viajes Publicados</p><p className="text-xl font-black text-slate-900">{trips.length}</p></div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><Users className="h-6 w-6 text-emerald-600 mb-2" /><p className="text-xs font-bold text-slate-400 uppercase">Asientos Vendidos</p><p className="text-xl font-black text-slate-900">{totalSold}</p></div>
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><Star className="h-6 w-6 text-amber-500 mb-2" /><p className="text-xs font-bold text-slate-400 uppercase">Calificación</p><p className="text-xl font-black text-slate-900">⭐ {agency?.rating_avg || 'N/A'} ({reviews.length})</p></div>
      </div>

      {/* Trips Table */}
      <div className="mt-8 rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b"><tr><th className="px-6 py-4">Viaje</th><th className="px-6 py-4">Fecha</th><th className="px-6 py-4">Precio</th><th className="px-6 py-4">Asientos</th><th className="px-6 py-4">Estado</th><th className="px-6 py-4 text-right">Acciones</th></tr></thead>
          <tbody className="divide-y divide-slate-100">{trips.map(t => {
            const pct = Math.round(((t.blocked_seats?.length || 0) / t.total_seats) * 100);
            return (<tr key={t.id} className="hover:bg-slate-50/40">
              <td className="px-6 py-4 font-bold text-slate-800 max-w-[200px] truncate">{t.title}</td>
              <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(t.departure_date)}</td>
              <td className="px-6 py-4 font-bold">${currency(t.price)}</td>
              <td className="px-6 py-4"><span className="text-xs font-bold">{t.blocked_seats?.length || 0}/{t.total_seats} ({pct}%)</span><button onClick={() => setSeatTrip(t)} className="block text-[11px] font-bold text-emerald-600 hover:underline mt-1">⚙️ Gestionar</button></td>
              <td className="px-6 py-4">{t.is_approved ? <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Aprobado</span> : <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">Pendiente</span>}</td>
              <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button></td>
            </tr>);
          })}</tbody>
        </table>
        {trips.length === 0 && <div className="p-12 text-center text-sm text-slate-500">No tienes viajes publicados. <Link to="/agency/trips/new" className="text-emerald-600 font-bold hover:underline">Crea tu primer viaje</Link></div>}
      </div>

      {/* Recent Bookings */}
      <div className="mt-8">
        <h3 className="text-lg font-black text-slate-900 mb-4">Reservas Recientes</h3>
        {bookings.length > 0 ? (
          <div className="space-y-3">{bookings.slice(0, 10).map(b => (
            <div key={b.id} className="rounded-xl border border-slate-100 bg-white p-4 flex items-center justify-between shadow-sm">
              <div><p className="text-sm font-bold text-slate-800">{b.contact_name}</p><p className="text-xs text-slate-500">Asientos: {b.selected_seats.join(', ')} • ${currency(b.total_price)} MXN</p></div>
              <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{b.status}</span>
            </div>
          ))}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-white/50">
            <p className="text-sm text-slate-400 font-medium">Aún no tienes reservaciones registradas.</p>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <h3 className="text-lg font-black text-slate-900 mb-4">Reseñas de Viajeros</h3>
        {reviews.length > 0 ? (
          <div className="space-y-3">{reviews.map(r => (
            <div key={r.id} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2"><span className="text-amber-500 font-bold">{'⭐'.repeat(r.rating)}</span><span className="text-xs text-slate-400">{formatDate(r.created_at)}</span></div>
              {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
            </div>
          ))}</div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-white/50">
            <p className="text-sm text-slate-400 font-medium">Aún no has recibido reseñas de viajeros.</p>
          </div>
        )}
      </div>

      {/* Seat Management Modal */}
      {seatTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between"><h4 className="font-extrabold text-slate-900 text-base">Gestión de Asientos</h4><button onClick={() => setSeatTrip(null)} className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:bg-slate-50"><X className="h-5 w-5" /></button></div>
            <div className="rounded-2xl border border-slate-150 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4"><span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{seatTrip.total_seats} lugares</span><span className="text-xs font-bold">{seatTrip.blocked_seats.length} vendidos</span></div>
              <div className="grid grid-cols-4 gap-2.5 justify-items-center">{Array.from({ length: seatTrip.total_seats }).map((_, i) => {
                const n = i + 1;
                const blocked = seatTrip.blocked_seats.includes(n);
                return <button key={n} onClick={() => handleToggleSeat(seatTrip.id, n)} className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold border transition ${blocked ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500'}`}>{n}</button>;
              })}</div>
            </div>
            <button onClick={() => setSeatTrip(null)} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-800">Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}