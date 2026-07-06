-- ============================================
-- VIAJOTECA - Esquema inicial de base de datos
-- Ejecutar en: Supabase > SQL Editor
-- ============================================

-- 1. Perfiles de usuario (extiende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'traveler' CHECK (role IN ('traveler', 'agency', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Agencias de viaje
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  rating_avg NUMERIC(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Viajes
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  departure_city TEXT NOT NULL,
  destination TEXT NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'MXN',
  images TEXT[] DEFAULT '{}',
  category TEXT NOT NULL,
  duration_text TEXT,
  vehicle_type TEXT DEFAULT 'Autobús',
  total_seats INTEGER NOT NULL DEFAULT 40,
  blocked_seats INTEGER[] DEFAULT '{}',
  departure_address TEXT,
  departure_instructions TEXT,
  departure_lat NUMERIC(10,7),
  departure_lng NUMERIC(10,7),
  departure_embed_url TEXT,
  whats_included TEXT[] DEFAULT '{}',
  whats_not_included TEXT[] DEFAULT '{}',
  whatsapp_number TEXT,
  is_approved BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Itinerario por viaje
CREATE TABLE itinerary_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  time_or_day TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 5. Reservaciones
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  selected_seats INTEGER[] NOT NULL,
  passengers JSONB DEFAULT '[]',
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  total_price NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reseñas
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itinerary_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, users can update their own
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can edit own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Agencies: anyone can read, owners can update
CREATE POLICY "Agencies viewable by everyone" ON agencies FOR SELECT USING (true);
CREATE POLICY "Agency owners can insert" ON agencies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Agency owners can update" ON agencies FOR UPDATE USING (auth.uid() = user_id);

-- Trips: anyone can read approved, agency owners can CRUD
CREATE POLICY "Approved trips viewable" ON trips FOR SELECT USING (true);
CREATE POLICY "Agency can insert trips" ON trips FOR INSERT WITH CHECK (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));
CREATE POLICY "Agency can update trips" ON trips FOR UPDATE USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));
CREATE POLICY "Agency can delete trips" ON trips FOR DELETE USING (agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid()));

-- Itinerary: anyone can read, trip owners can CRUD
CREATE POLICY "Itinerary viewable" ON itinerary_items FOR SELECT USING (true);
CREATE POLICY "Trip owners can insert itinerary" ON itinerary_items FOR INSERT WITH CHECK (trip_id IN (SELECT id FROM trips WHERE agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())));
CREATE POLICY "Trip owners can update itinerary" ON itinerary_items FOR UPDATE USING (trip_id IN (SELECT id FROM trips WHERE agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())));
CREATE POLICY "Trip owners can delete itinerary" ON itinerary_items FOR DELETE USING (trip_id IN (SELECT id FROM trips WHERE agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())));

-- Bookings: users can see own, agencies can see their trips' bookings
CREATE POLICY "Users can see own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id OR trip_id IN (SELECT id FROM trips WHERE agency_id IN (SELECT id FROM agencies WHERE user_id = auth.uid())));
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews: anyone can read, booking owners can create
CREATE POLICY "Reviews viewable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Booking owners can review" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
