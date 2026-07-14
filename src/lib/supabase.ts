import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || '';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(url && key);
export const TRIP_IMAGES_BUCKET = 'trip-images';

// Only create the client if configured, to avoid crashes
export const supabase = isSupabaseConfigured ? createClient(url, key) : null;