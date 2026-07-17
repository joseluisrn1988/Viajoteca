-- ============================================
-- VIAJOTECA - Múltiples puntos de recogida
-- Ejecutar en: Supabase > SQL Editor
-- ============================================

CREATE TABLE trip_pickup_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  instructions TEXT,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  embed_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pickup_points_trip ON trip_pickup_points(trip_id);

-- Migrar datos existentes de los campos legacy a la nueva tabla
INSERT INTO trip_pickup_points (trip_id, address, instructions, lat, lng, embed_url, sort_order)
SELECT
  id,
  departure_address,
  departure_instructions,
  departure_lat,
  departure_lng,
  departure_embed_url,
  0
FROM trips
WHERE departure_address IS NOT NULL AND departure_address <> '';

-- RLS
ALTER TABLE trip_pickup_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pickup points are public"
ON trip_pickup_points FOR SELECT
TO public
USING (true);

CREATE POLICY "Agency owners can insert pickup points"
ON trip_pickup_points FOR INSERT
TO authenticated
WITH CHECK (
  trip_id IN (
    SELECT t.id FROM trips t
    JOIN agencies a ON t.agency_id = a.id
    WHERE a.user_id = auth.uid()
  )
);

CREATE POLICY "Agency owners can update pickup points"
ON trip_pickup_points FOR UPDATE
TO authenticated
USING (
  trip_id IN (
    SELECT t.id FROM trips t
    JOIN agencies a ON t.agency_id = a.id
    WHERE a.user_id = auth.uid()
  )
);

CREATE POLICY "Agency owners can delete pickup points"
ON trip_pickup_points FOR DELETE
TO authenticated
USING (
  trip_id IN (
    SELECT t.id FROM trips t
    JOIN agencies a ON t.agency_id = a.id
    WHERE a.user_id = auth.uid()
  )
);
