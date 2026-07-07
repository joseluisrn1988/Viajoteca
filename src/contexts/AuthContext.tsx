import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile, Agency } from '../types';
import type { User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

interface AuthCtx {
  user: User | null;
  profile: Profile | null;
  agency: Agency | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string, role: 'traveler' | 'agency', agencyName?: string, whatsapp?: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (uid: string) => {
    if (!supabase) return;
    const { data: p } = await supabase.from('profiles').select('*').eq('id', uid).single();
    if (p) {
      setProfile(p);
      if (p.role === 'agency') {
        const { data: a } = await supabase.from('agencies').select('*').eq('user_id', uid).single();
        if (a) setAgency(a);
      }
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) { setUser(session.user); loadProfile(session.user.id); }
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) loadProfile(u.id); else { setProfile(null); setAgency(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string, role: 'traveler' | 'agency', agencyName?: string, whatsapp?: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) { toast.error('Supabase no configurado'); return false; }
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) { toast.error(error?.message || 'Error al registrarse'); return false; }
    await supabase.from('profiles').insert({ id: data.user.id, email, full_name: fullName, phone, role });
    if (role === 'agency' && agencyName) {
      await supabase.from('agencies').insert({ user_id: data.user.id, name: agencyName, whatsapp: whatsapp || phone });
    }
    toast.success('Cuenta creada exitosamente');
    return true;
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) { toast.error('Supabase no configurado'); return false; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { toast.error(error.message); return false; }
    toast.success('Bienvenido de vuelta');
    return true;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null); setProfile(null); setAgency(null);
    toast.success('Sesión cerrada');
  };

  return <AuthContext.Provider value={{ user, profile, agency, loading, signUp, signIn, signOut }}>{children}</AuthContext.Provider>;
}
