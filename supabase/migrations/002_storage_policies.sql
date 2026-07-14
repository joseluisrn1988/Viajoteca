-- ============================================
-- VIAJOTECA - Storage de imágenes de viajes
-- Ejecutar después de 001_initial_schema.sql
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-images',
  'trip-images',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Cada imagen se guarda en la carpeta del usuario autenticado:
-- {auth.uid()}/{trip_id}/{archivo}

DROP POLICY IF EXISTS "Public can read trip images" ON storage.objects;
CREATE POLICY "Public can read trip images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'trip-images');

DROP POLICY IF EXISTS "Agencies can upload own trip images" ON storage.objects;
CREATE POLICY "Agencies can upload own trip images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'trip-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  AND EXISTS (
    SELECT 1
    FROM public.agencies
    WHERE user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Agencies can delete own trip images" ON storage.objects;
CREATE POLICY "Agencies can delete own trip images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'trip-images'
  AND (storage.foldername(name))[1] = (SELECT auth.uid()::text)
  AND EXISTS (
    SELECT 1
    FROM public.agencies
    WHERE user_id = auth.uid()
  )
);