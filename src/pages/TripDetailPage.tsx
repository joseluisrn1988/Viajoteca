import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTrips } from '../contexts/TripContext';
import { useAuth } from '../contexts/AuthContext';
import TripDetail from '../components/trips/TripDetail';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import type { Trip, Review, Booking } from '../types';
import { Star } from 'lucide-react';
import { formatDate } from '../lib/utils';


export default function TripDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { fetchTripById, fetchAgencyReviews, createReview, fetchUserBookings } = useTrips();
  const { user, profile } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (id) load(); }, [id]);

  const load = async () => {
    setLoading(true);
    const t = await fetchTripById(id!);
    setTrip(t);
    if (t?.agency) {
      const r = await fetchAgencyReviews(t.agency.id);
      setReviews(r);
    }
    if (user) {
      const b = await fetchUserBookings(user.id);
      setUserBookings(b);
    }
    setLoading(false);
  };

  // Can review if: user has a booking for this trip, trip date has passed, and hasn't reviewed yet
  const tripBooking = userBookings.find(b => b.trip_id === id);
  const tripPassed = trip ? new Date(trip.departure_date) < new Date() : false;
  const alreadyReviewed = reviews.some(r => r.user_id === user?.id);
  const canReview = Boolean(tripBooking && tripPassed && !alreadyReviewed && profile?.role === 'traveler');

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip?.agency || !user || !tripBooking) return;
    setSubmitting(true);
    const ok = await createReview({ agency_id: trip.agency.id, user_id: user.id, booking_id: tripBooking.id, rating, comment: comment || null });
    setSubmitting(false);
    if (ok) { setComment(''); load(); }
  };

  if (loading) return <LoadingSpinner text="Cargando viaje..." />;
  if (!trip) return <div className="flex min-h-[60vh] items-center justify-center"><p className="text-lg font-bold text-slate-400">Viaje no encontrado.</p></div>;

  return (
    <div>
      <TripDetail trip={trip} />
      {/* Reviews Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 mt-8 space-y-8">
        {/* Review Form */}
        {canReview && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Califica tu experiencia</h3>
            <p className="text-xs text-slate-500 mt-1">Tu opinión ayuda a otros viajeros a decidir.</p>
            <form onSubmit={handleReview} className="mt-6 space-y-4">
              <div className="flex gap-1">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" onClick={() => setRating(n)} className="p-1"><Star className={`h-7 w-7 transition ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} /></button>)}</div>
              <textarea rows={3} placeholder="Cuéntanos cómo fue tu experiencia... (opcional)" value={comment} onChange={e => setComment(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
              <button type="submit" disabled={submitting} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50">{submitting ? 'Enviando...' : 'Publicar Reseña'}</button>
            </form>
          </div>
        )}
        {/* Reviews List */}
        {reviews.length > 0 && (
          <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Reseñas de viajeros ({reviews.length})</h3>
            <div className="mt-6 space-y-4">{reviews.map(r => (
              <div key={r.id} className="border-b border-slate-100 pb-4 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-bold text-sm">{'⭐'.repeat(r.rating)}</span>
                  <span className="text-xs text-slate-400">{formatDate(r.created_at)}</span>
                  {r.profile && <span className="text-xs font-semibold text-slate-600">— {(r.profile as any).full_name || 'Viajero'}</span>}
                </div>
                {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
              </div>
            ))}</div>
          </div>
        )}
      </div>
    </div>
  );
}
