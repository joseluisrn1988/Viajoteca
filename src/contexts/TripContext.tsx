import { createContext, useContext, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured, TRIP_IMAGES_BUCKET } from '../lib/supabase';
import type { Trip, Booking, Review, Agency, ItineraryItem, TripImageInput, PickupPoint } from '../types';
import toast from 'react-hot-toast';

const ADMIN_PASSWORD = 'Grupo2026*adn';

interface TripCtx {
  trips: Trip[];
  loading: boolean;
  fetchTrips: () => Promise<void>;
  fetchTripById: (id: string) => Promise<Trip | null>;
  fetchAgencyTrips: (agencyId: string) => Promise<Trip[]>;
  createTrip: (d: Omit<Trip, 'id' | 'created_at' | 'agency'>, items: ItineraryItem[], imageInputs?: TripImageInput[], pickupPoints?: PickupPoint[]) => Promise<Trip | null>;
  updateTrip: (id: string, d: Partial<Trip>, items?: ItineraryItem[], pickupPoints?: PickupPoint[]) => Promise<boolean>;
  deleteTrip: (id: string) => Promise<boolean>;
  toggleSeat: (tripId: string, seat: number) => Promise<boolean>;
  createBooking: (b: Omit<Booking, 'id' | 'created_at' | 'trip'>) => Promise<Booking | null>;
  fetchUserBookings: (uid: string) => Promise<Booking[]>;
  fetchTripBookings: (tid: string) => Promise<Booking[]>;
  createReview: (r: Omit<Review, 'id' | 'created_at' | 'profile'>) => Promise<boolean>;
  fetchAgencyReviews: (aid: string) => Promise<Review[]>;
  allAgencies: Agency[];
  adminFetchAll: () => Promise<void>;
  adminVerifyAgency: (id: string, v: boolean) => Promise<boolean>;
  adminApproveTrip: (id: string, a: boolean) => Promise<boolean>;
}

const TripContext = createContext<TripCtx>({} as TripCtx);
export const useTrips = () => useContext(TripContext);

export function TripProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [allAgencies, setAllAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(false);

  const getTripImagePath = (url: string): string | null => {
    const publicMarker = `/storage/v1/object/public/${TRIP_IMAGES_BUCKET}/`;
    const signedMarker = `/storage/v1/object/sign/${TRIP_IMAGES_BUCKET}/`;
    const marker = url.includes(publicMarker) ? publicMarker : signedMarker;
    if (!url.includes(marker)) return null;

    const pathWithPossibleQuery = url.split(marker)[1];
    if (!pathWithPossibleQuery) return null;
    return decodeURIComponent(pathWithPossibleQuery.split('?')[0]);
  };

  const uploadTripImages = async (tripId: string, imageInputs: TripImageInput[]): Promise<string[]> => {
    if (!supabase) return [];

    const existingUrls = imageInputs.filter((image): image is string => typeof image === 'string');
    const newFiles = imageInputs.filter((image): image is File => image instanceof File);
    if (newFiles.length === 0) return existingUrls;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Tu sesión expiró. Inicia sesión de nuevo para subir imágenes.');
      return existingUrls;
    }

    const uploadedUrls: string[] = [];
    for (const file of newFiles) {
      const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
      const safeFileName = `${crypto.randomUUID()}.${extension}`;
      const path = `${user.id}/${tripId}/${safeFileName}`;
      const { error } = await supabase.storage.from(TRIP_IMAGES_BUCKET).upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

      if (error) {
        toast.error(`No se pudo subir ${file.name}: ${error.message}`);
        continue;
      }

      const { data } = supabase.storage.from(TRIP_IMAGES_BUCKET).getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    return [...existingUrls, ...uploadedUrls];
  };

  const fetchTrips = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    const { data } = await supabase.from('trips').select('*, agency:agencies(*), pickup_points:trip_pickup_points(*)').eq('is_approved', true).eq('status', 'active').order('departure_date');
    if (data) setTrips(data as Trip[]);
    setLoading(false);
  };

  const fetchTripById = async (id: string): Promise<Trip | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data: trip } = await supabase.from('trips').select('*, agency:agencies(*), pickup_points:trip_pickup_points(*)').eq('id', id).single();
    if (!trip) return null;
    const { data: items } = await supabase.from('itinerary_items').select('*').eq('trip_id', id).order('sort_order');
    return { ...trip, itinerary_items: items || [], pickup_points: trip.pickup_points || [] } as Trip;
  };

  const fetchAgencyTrips = async (agencyId: string): Promise<Trip[]> => {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data } = await supabase.from('trips').select('*, pickup_points:trip_pickup_points(*)').eq('agency_id', agencyId).order('departure_date', { ascending: false });
    return (data || []) as Trip[];
  };

  const createTrip = async (d: Omit<Trip, 'id' | 'created_at' | 'agency'>, items: ItineraryItem[] = [], imageInputs: TripImageInput[] = d.images, pickupPoints: PickupPoint[] = []): Promise<Trip | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('trips').insert(d).select().single();
    if (error || !data) { toast.error(error?.message || 'Error'); return null; }

    const finalImages = await uploadTripImages(data.id, imageInputs);
    const { data: updatedTrip, error: imageError } = await supabase
      .from('trips')
      .update({ images: finalImages })
      .eq('id', data.id)
      .select()
      .single();

    if (imageError) {
      toast.error(`El viaje se creó, pero no se pudieron guardar sus imágenes: ${imageError.message}`);
    }

    if (items.length > 0) {
      const toInsert = items.map((it, i) => ({ trip_id: data.id, time_or_day: it.time_or_day, title: it.title, description: it.description, sort_order: i }));
      await supabase.from('itinerary_items').insert(toInsert);
    }

    if (pickupPoints.length > 0) {
      const pps = pickupPoints.map((p, i) => ({ ...p, trip_id: data.id, sort_order: i }));
      await supabase.from('trip_pickup_points').insert(pps);
    }

    toast.success('Viaje creado exitosamente');
    return (updatedTrip || data) as Trip;
  };

  const updateTrip = async (id: string, d: Partial<Trip>, items?: ItineraryItem[], pickupPoints?: PickupPoint[]): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    const cleanD = { ...d };
    delete cleanD.agency; delete cleanD.itinerary_items; delete cleanD.pickup_points;
    const { error } = await supabase.from('trips').update(cleanD).eq('id', id);
    if (error) { toast.error(error.message); return false; }
    if (items) {
      await supabase.from('itinerary_items').delete().eq('trip_id', id);
      if (items.length > 0) {
        const toInsert = items.map((it, i) => ({ trip_id: id, time_or_day: it.time_or_day, title: it.title, description: it.description, sort_order: i }));
        await supabase.from('itinerary_items').insert(toInsert);
      }
    }
    if (pickupPoints) {
      await supabase.from('trip_pickup_points').delete().eq('trip_id', id);
      if (pickupPoints.length > 0) {
        const pps = pickupPoints.map((p, i) => ({ ...p, trip_id: id, sort_order: i }));
        await supabase.from('trip_pickup_points').insert(pps);
      }
    }
    toast.success('Viaje actualizado');
    return true;
  };

  const deleteTrip = async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    const { data: trip, error: tripError } = await supabase.from('trips').select('images').eq('id', id).single();
    if (tripError) { toast.error(tripError.message); return false; }

    const tripImages: string[] = Array.isArray(trip?.images) ? (trip.images as string[]) : [];
    const storagePaths = tripImages
      .map((imageUrl) => getTripImagePath(imageUrl))
      .filter((path: string | null): path is string => path !== null);

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabase.storage.from(TRIP_IMAGES_BUCKET).remove(storagePaths);
      if (storageError) {
        toast.error(`No se pudieron eliminar las imágenes: ${storageError.message}`);
        return false;
      }
    }

    const { error } = await supabase.from('trips').delete().eq('id', id);
    if (error) { toast.error(error.message); return false; }
    toast.success('Viaje eliminado');
    return true;
  };

  const toggleSeat = async (tripId: string, seat: number): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    const { data: trip } = await supabase.from('trips').select('blocked_seats').eq('id', tripId).single();
    if (!trip) return false;
    const bs: number[] = trip.blocked_seats || [];
    const updated = bs.includes(seat) ? bs.filter(s => s !== seat) : [...bs, seat];
    const { error } = await supabase.from('trips').update({ blocked_seats: updated }).eq('id', tripId);
    if (error) return false;
    return true;
  };

  const createBooking = async (b: Omit<Booking, 'id' | 'created_at' | 'trip'>): Promise<Booking | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('bookings').insert(b).select().single();
    if (error || !data) { toast.error(error?.message || 'Error'); return null; }
    const { data: trip } = await supabase.from('trips').select('blocked_seats').eq('id', b.trip_id).single();
    if (trip) {
      const updated = Array.from(new Set([...(trip.blocked_seats || []), ...b.selected_seats]));
      await supabase.from('trips').update({ blocked_seats: updated }).eq('id', b.trip_id);
    }
    toast.success('Reserva creada');
    return data as Booking;
  };

  const fetchUserBookings = async (uid: string): Promise<Booking[]> => {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data } = await supabase.from('bookings').select('*, trip:trips(*, agency:agencies(*))').eq('user_id', uid).order('created_at', { ascending: false });
    return (data || []) as Booking[];
  };

  const fetchTripBookings = async (tid: string): Promise<Booking[]> => {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data } = await supabase.from('bookings').select('*').eq('trip_id', tid).order('created_at', { ascending: false });
    return (data || []) as Booking[];
  };

  const createReview = async (r: Omit<Review, 'id' | 'created_at' | 'profile'>): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.from('reviews').insert(r);
    if (error) { toast.error(error.message); return false; }
    const { data: reviews } = await supabase.from('reviews').select('rating').eq('agency_id', r.agency_id);
    if (reviews && reviews.length > 0) {
      const avg = reviews.reduce((s, rv) => s + rv.rating, 0) / reviews.length;
      await supabase.from('agencies').update({ rating_avg: Math.round(avg * 10) / 10, total_reviews: reviews.length }).eq('id', r.agency_id);
    }
    toast.success('Reseña publicada');
    return true;
  };

  const fetchAgencyReviews = async (aid: string): Promise<Review[]> => {
    if (!isSupabaseConfigured || !supabase) return [];
    const { data } = await supabase.from('reviews').select('*, profile:profiles(full_name)').eq('agency_id', aid).order('created_at', { ascending: false });
    return (data || []) as Review[];
  };

  const adminFetchAll = async () => {
    if (!isSupabaseConfigured || !supabase) return;
    setLoading(true);
    const { data: t } = await supabase.from('trips').select('*, agency:agencies(*)').order('created_at', { ascending: false });
    if (t) setTrips(t as Trip[]);
    const { data: a } = await supabase.from('agencies').select('*').order('created_at', { ascending: false });
    if (a) setAllAgencies(a as Agency[]);
    setLoading(false);
  };

  const adminVerifyAgency = async (id: string, v: boolean): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.rpc('admin_verify_agency', {
      p_agency_id: id,
      p_is_verified: v,
      p_admin_password: ADMIN_PASSWORD,
    });
    if (error) { toast.error(error.message); return false; }
    toast.success(v ? 'Agencia verificada' : 'Verificación removida');
    return true;
  };

  const adminApproveTrip = async (id: string, a: boolean): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) return false;
    const { error } = await supabase.rpc('admin_approve_trip', {
      p_trip_id: id,
      p_is_approved: a,
      p_admin_password: ADMIN_PASSWORD,
    });
    if (error) { toast.error(error.message); return false; }
    toast.success(a ? 'Viaje aprobado' : 'Viaje rechazado');
    return true;
  };

  return (
    <TripContext.Provider value={{ trips, loading, fetchTrips, fetchTripById, fetchAgencyTrips, createTrip, updateTrip, deleteTrip, toggleSeat, createBooking, fetchUserBookings, fetchTripBookings, createReview, fetchAgencyReviews, allAgencies, adminFetchAll, adminVerifyAgency, adminApproveTrip }}>
      {children}
    </TripContext.Provider>
  );
}