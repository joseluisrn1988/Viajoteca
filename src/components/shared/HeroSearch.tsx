import { Search, MapPin, SlidersHorizontal, ShieldCheck, Info } from 'lucide-react';
import { TRIP_CATEGORIES, DEPARTURE_CITIES } from '../../types';

interface Props { city: string; setCity: (c: string) => void; query: string; setQuery: (q: string) => void; category: string; setCategory: (c: string) => void; }

export default function HeroSearch({ city, setCity, query, setQuery, category, setCategory }: Props) {
  return (
    <div className="relative overflow-hidden bg-slate-900 text-white">
      {/* Decorative Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-950/50 via-slate-900 to-slate-950" />
      <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 pt-20 pb-8 sm:px-6 sm:pt-24 sm:pb-12">
        {/* Header */}
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" />Agencias verificadas • Tu lugar garantizado
          </span>
          <h1 className="mt-4 text-2xl font-black leading-tight tracking-tight sm:text-4xl">Deja de soñar destinos.<br className="hidden sm:block" /> <span className="text-emerald-400">Empieza a vivirlos.</span></h1>
          <p className="mx-auto mt-2.5 max-w-xl text-xs text-slate-300 sm:text-sm">Viajes y escapadas con salida desde tu municipio, precios transparentes y reserva de confianza.</p>
        </div>

        {/* Search Bar */}
        <div className="mx-auto mt-6 max-w-3xl sm:mt-8">
          <div className="rounded-2xl bg-white p-2 shadow-2xl shadow-black/30 sm:p-2.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              {/* City Selector */}
              <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                <MapPin className="h-5 w-5 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Sales desde</span>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      }}
                    className="w-full cursor-pointer bg-transparent text-sm font-semibold text-slate-900 focus:outline-none appearance-none"
                  >
                    <option value="">🌍 Selecciona tu municipio</option>
                    {DEPARTURE_CITIES.map((municipio, idx) => (
                      <option key={idx} value={municipio}>{municipio}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destination Search */}
              <div className="flex flex-[1.4] items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
                <Search className="h-5 w-5 shrink-0 text-emerald-500" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">¿A dónde quieres ir?</span>
                  <input
                    type="text"
                    placeholder="Tolantongo, playa..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Search Button */}
              <button
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 active:scale-[0.98]"
                onClick={() => {}}
              >
                <Search className="h-4 w-4" />Buscar
              </button>
            </div>

            {/* Info message below search bar - Pickup point info */}
            <div className="mt-3 mx-auto max-w-3xl rounded-xl bg-blue-50 border border-blue-100/60 px-4 py-3 flex items-start gap-2.5">
              <Info className="h-4.5 w-4.5 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-700 font-medium leading-snug">
                🚌 <strong>Información de recogida:</strong> Al seleccionar tu municipio, cada viaje tendrá puntos de recogida en diferentes localidades del mismo (cabecera central, rancherías, tiendas OXXO, paraderos). La dirección exacta se muestra en la ficha del viaje.
              </p>
            </div>

            {/* Category Filters */}
            <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              <button onClick={() => setCategory('')} className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${category === '' ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-200 hover:bg-white/20'}`}>Todos</button>
              {TRIP_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${category === cat ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-200 hover:bg-white/20'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
