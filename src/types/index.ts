// src/types/index.ts
export interface ItineraryItem {
  timeOrDay: string;
  title: string;
  description: string;
}

export interface Review {
  id: string;
  travelerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Agency {
  id: string;
  name: string;
  logo: string;
  rating: number;
  totalTrips: number;
  isVerified: boolean;
  phone: string;
  description?: string;
  email?: string;
  reviews: Review[];
}

export interface Trip {
  id: string;
  title: string;
  description: string;
  departureCity: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  price: number;
  currency: string;
  images: string[];
  category: 'Playa' | 'Naturaleza' | 'Pueblo Mágico' | 'Aventura' | 'Cultural' | 'Fin de Semana';
  durationText: string;
  departureLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
    instructions: string;
    embedUrl?: string;
  };
  whatsIncluded: string[];
  whatsNotIncluded: string[];
  itinerary: ItineraryItem[];
  agencyId?: string;
  agency: Agency;
  totalSeats: number;
  blockedSeats: number[];
  whatsappNumber: string;
  is_approved?: boolean;
  status?: string;
  created_at?: string;
}

export interface Booking {
  id: string;
  tripId: string;
  tripTitle: string;
  travelerId: string;
  travelerName: string;
  selectedSeats: number[];
  totalPrice: number;
  bookingDate: string;
  status: 'pending' | 'confirmed';
  reviewed?: boolean;
}