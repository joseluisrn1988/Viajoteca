import { useState, useEffect } from 'react';
import { useTrips } from '../contexts/TripContext';
import HeroSearch from '../components/shared/HeroSearch';
import TripCard from '../components/trips/TripCard';
import TripSection from '../components/trips/TripSection';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import { Compass, RefreshCw, ShieldCheck, Star, BadgeInfo, ShieldAlert } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

const CAT_META: Record<string, { title: string; subtitle: string; emoji: string }> = {
  'Playa': { title: 'Viajes a la playa', subtitle: 'Sol, arena y mar.', emoji: '🏖️' },
  'Naturaleza': { title: 'Naturaleza y aventura', subtitle: 'Cascadas, grutas y paisajes.', emoji: '🌿' },
  'Pueblo Mágico': { title: 'Pueblos Mágicos', subtitle: 'Tradición y encanto.', emoji: '✨' },
  'Aventura': { title: 'Pura adrenalina', subtitle: 'Emociones extremas.', emoji: '🧗' },
  'Cultural': { title: 'Experiencias culturales', subtitle: 'Historia y gastronomía.', emoji: '🏛️' },
  'Fin de Semana': { title: 'Escapadas de fin de semana', subtitle: 'Sin pedir vacaciones.', emoji: '🗓️' },
};

export default function HomePage() {
  const { trips, loading, fetchTrips } = useTrips();
  const [city, setCity] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => { fetchTrips(); }, []);

  const filtered = trips.filter(t => {
    if (city && t.departure_city !== city) return false;
    if (category && t.category !== category) return false;
    if (query && !t.title.toLowerCase().includes(query.toLowerCase()) && !t.destination.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  }).sort((a, b) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime());

  const hasFilters = Boolean(city || query || category);
  const upcoming = [...filtered].slice(0, 10);
  const categories = Array.from(new Set(trips.map(t => t.category)));
  const catSections = categories.map(cat => {
    const m = CAT_META[cat] || { title: cat, subtitle: '', emoji: '📍' };
    return { ...m, category: cat, trips: filtered.filter(t => t.category === cat) };
  });

  const resetFilters = () => { setCity(''); setQuery(''); setCategory(''); };

  if (!isSupabaseConfigured) return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-12 max-w-md">
        <h2 className="text-2xl font-black text-slate-900">⚙️ Configuración Necesaria</h2>
        <p className="mt-4 text-sm text-slate-600 leading-relaxed">Para que Viajoteca funcione, necesitas conectar Supabase. Crea un archivo <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">.env</code> en la raíz del proyecto con tus credenciales:</p>
        <pre className="mt-4 rounded-xl bg-slate-900 p-4 text-left text-xs text-emerald-400 font-mono overflow-x-auto">VITE_SUPABASE_URL=tu-url{'\n'}VITE_SUPABASE_ANON_KEY=tu-key</pre>
        <p className="mt-4 text-xs text-slate-500">Consulta el README.md para instrucciones completas.</p>
      </div>
    </div>
  );

  return (
    <div>
      <HeroSearch city={city} setCity={setCity} query={query} setQuery={setQuery} category={category} setCategory={setCategory} />
      {loading ? <LoadingSpinner text="Cargando viajes..." /> : hasFilters ? (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-5">
            <div><h2 className="flex items-center gap-2 text-lg font-black text-slate-900"><Compass className="h-5 w-5 text-emerald-500" />Resultados</h2><p className="mt-1 text-xs text-slate-500">{filtered.length} viajes encontrados</p></div>
            <button onClick={resetFilters} className="inline-flex items-center gap-1 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-100/50"><RefreshCw className="h-3.5 w-3.5" />Limpiar</button>
          </div>
          {filtered.length > 0 ? <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(t => <TripCard key={t.id} trip={t} />)}</div> :
            <div className="mt-12 text-center"><p className="text-sm text-slate-500">No hay viajes que coincidan con tu búsqueda.</p><button onClick={resetFilters} className="mt-4 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">Ver todos</button></div>}
        </div>
      ) : (
        <div className="space-y-10 pt-8 pb-24">
          <TripSection title="Salidas más próximas" subtitle="Reserva rápido, salen pronto." emoji="🔥" trips={upcoming} />
          {catSections.map(s => <TripSection key={s.category} title={s.title} subtitle={s.subtitle} emoji={s.emoji} trips={s.trips} />)}
          {trips.length === 0 && <div className="text-center py-20"><p className="text-lg font-bold text-slate-400">Aún no hay viajes publicados.</p><p className="text-sm text-slate-400 mt-2">Las agencias pronto empezarán a subir sus destinos.</p></div>}
        </div>
      )}
      {/* Trust section */}
      <section className="bg-slate-100 border-t border-slate-200/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <h3 className="text-xl font-extrabold text-slate-900">¿Por qué <span className="text-emerald-600">Viajoteca</span>?</h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[{ icon: ShieldCheck, title: '100% Verificado', desc: 'Solo agencias registradas y auditadas.' },
              { icon: Star, title: 'Opiniones Reales', desc: 'Solo opina quien viajó.' },
              { icon: BadgeInfo, title: 'Precios Transparentes', desc: 'Lo que ves es lo que pagas.' },
              { icon: ShieldAlert, title: 'Protección Antiestafas', desc: 'Tu dinero está protegido.' }
            ].map((item, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border text-center shadow-xs">
                <div className="mx-auto h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-3"><item.icon className="h-5 w-5" /></div>
                <h5 className="font-extrabold text-sm text-slate-900">{item.title}</h5>
                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
