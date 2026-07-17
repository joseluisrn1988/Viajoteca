export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'traveler' | 'agency' | 'admin';
  created_at: string;
}

export interface Agency {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  is_verified: boolean;
  rating_avg: number;
  total_reviews: number;
  created_at: string;
}

export interface PickupPoint {
  id?: string;
  trip_id?: string;
  address: string;
  instructions: string | null;
  lat: number | null;
  lng: number | null;
  embed_url: string | null;
  sort_order: number;
}

export interface Trip {
  id: string;
  agency_id: string;
  title: string;
  description: string | null;
  departure_city: string;
  destination: string;
  departure_date: string;
  return_date: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  duration_text: string | null;
  vehicle_type: string;
  total_seats: number;
  blocked_seats: number[];
  departure_address?: string | null;      // Obsoleto
  departure_instructions?: string | null; // Obsoleto
  departure_lat?: number | null;          // Obsoleto
  departure_lng?: number | null;          // Obsoleto
  departure_embed_url?: string | null;    // Obsoleto
  whats_included: string[];
  whats_not_included: string[];
  whatsapp_number: string | null;
  is_approved: boolean;
  status: string;
  created_at: string;
  agency?: Agency;
  itinerary_items?: ItineraryItem[];
  pickup_points?: PickupPoint[];
}

// Las URLs representan imágenes ya guardadas; los File son imágenes pendientes de subir.
export type TripImageInput = string | File;

export interface ItineraryItem {
  id?: string;
  trip_id?: string;
  time_or_day: string;
  title: string;
  description: string | null;
  sort_order: number;
}

export interface Booking {
  id: string;
  trip_id: string;
  user_id: string;
  selected_seats: number[];
  passengers: { name: string; seat: number }[];
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  trip?: Trip;
}

export interface Review {
  id: string;
  agency_id: string;
  user_id: string;
  booking_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profile?: Profile;
}

export const SEAT_PRESETS = [10, 12, 15, 19, 20, 24, 30, 32, 40, 44, 48, 52] as const;

export const VEHICLE_SUGGESTIONS: Record<number, string> = {
  10: 'Van', 12: 'Van Ejecutiva', 15: 'Sprinter', 19: 'Sprinter Ejecutiva',
  20: 'Minibús', 24: 'Minibús', 30: 'Autobús Mediano', 32: 'Autobús Mediano',
  40: 'Autobús de Turismo', 44: 'Autobús de Turismo', 48: 'Autobús Gran Turismo', 52: 'Autobús Gran Turismo',
};

export const TRIP_CATEGORIES = ['Playa', 'Naturaleza', 'Pueblo Mágico', 'Aventura', 'Cultural', 'Fin de Semana'] as const;

export const DEPARTURE_CITIES = [
  'Abasolo', 'Acámbaro', 'Apaseo el Alto', 'Apaseo el Bajo', 'Atarjea',
  'Celaya', 'Comonfort', 'Coroneo', 'Cortazar', 'Cuerámaro',
  'Doctor Mora', 'Dolores Hidalgo', 'Guanajuato', 'Huanímaro',
  'Irapuato', 'Jaral del Progreso', 'Jerécuaro', 'León', 'Manuel Doblado',
  'Moroleón', 'Ocampo', 'Pénjamo', 'Pueblo Nuevo', 'Purísima del Rincón',
  'Romita', 'Salamanca', 'Salvatierra', 'San Diego de la Unión', 'San Felipe',
  'San Francisco del Rincón', 'San José Iturbide', 'San Luis de la Paz',
  'Santa Catarina', 'Santa Cruz de Juventino Rosas', 'Santiago Maravatío',
  'Silao', 'Tarandacuao', 'Tarimoro', 'Tierra Blanca', 'Uriangato',
  'Valle de Santiago', 'Victoria', 'Villagrán', 'Xichú', 'Yuriria',
] as const;