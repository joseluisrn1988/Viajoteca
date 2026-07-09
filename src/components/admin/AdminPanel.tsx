import { useState, useEffect } from 'react';
import { useTrips } from '../../contexts/TripContext';
import { Lock, Eye, EyeOff, ShieldCheck, ShieldAlert, CheckCircle, XCircle, DollarSign, Compass, Users } from 'lucide-react';
import { formatDate, currency } from '../../lib/utils';
import LoadingSpinner from '../shared/LoadingSpinner';

const ADMIN_PASSWORD = 'Grupo2026*adn';

export default function AdminPanel() {
  const { trips, allAgencies, loading, adminFetchAll, adminVerifyAgency, adminApproveTrip } = useTrips();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [tab, setTab] = useState<'agencies' | 'trips' | 'stats'>('agencies');

  useEffect(() => { if (authed) adminFetchAll(); }, [authed]);

  const handlePw = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { setAuthed(true); setPwError(false); } else { setPwError(true); setPw(''); }
  };

  if (!authed) return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-8 shadow-2xl">
        <div className="text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600"><Lock className="h-7 w-7" /></div><h3 className="mt-5 text-xl font-black text-slate-900">Acceso Restringido</h3><p className="mt-2 text-sm text-slate-500">Ingresa la contraseña de administrador.</p></div>
        <form onSubmit={handlePw} className="mt-8 space-y-4">
          <div className="relative"><input type={showPw ? 'text' : 'password'} value={pw} onChange={e => { setPw(e.target.value); setPwError(false); }} placeholder="Contraseña" autoFocus className={`w-full rounded-xl border px-4 py-3 pr-12 text-sm font-medium focus:outline-none ${pwError ? 'border-rose-300 bg-rose-50' : 'border-slate-200 focus:border-emerald-500'}`} />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          {pwError && <p className="flex items-center gap-1.5 text-xs font-bold text-rose-500"><ShieldAlert className="h-3.5 w-3.5" />Contraseña incorrecta</p>}
          <button type="submit" className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700">Ingresar</button>
        </form>
      </div>
    </div>
  );

  if (loading) return <LoadingSpinner text="Cargando panel admin..." />;

  const totalRev = trips.reduce((a, t) => a + (t.blocked_seats?.length || 0) * t.price, 0);
  const _totalSeats = trips.reduce((a, t) => a + (t.blocked_seats?.length || 0), 0); void _totalSeats;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-slate-900">🛡️ Panel de Administración</h1>
      <p className="mt-1 text-sm text-slate-500">Verifica agencias, aprueba viajes y controla la plataforma.</p>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5 shadow-sm flex items-center gap-4"><DollarSign className="h-8 w-8 text-emerald-600" /><div><p className="text-xs font-bold text-slate-400 uppercase">Ventas Totales</p><p className="text-xl font-black text-slate-900">${currency(totalRev)}</p></div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm flex items-center gap-4"><Compass className="h-8 w-8 text-emerald-600" /><div><p className="text-xs font-bold text-slate-400 uppercase">Viajes</p><p className="text-xl font-black text-slate-900">{trips.length}</p></div></div>
        <div className="rounded-2xl border bg-white p-5 shadow-sm flex items-center gap-4"><Users className="h-8 w-8 text-emerald-600" /><div><p className="text-xs font-bold text-slate-400 uppercase">Agencias</p><p className="text-xl font-black text-slate-900">{allAgencies.length}</p></div></div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-slate-200">{['agencies', 'trips'].map(t => <button key={t} onClick={() => setTab(t as typeof tab)} className={`border-b-2 px-4 py-3 text-sm font-bold transition ${tab === t ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>{t === 'agencies' ? `Agencias (${allAgencies.length})` : `Viajes (${trips.length})`}</button>)}</div>

      {/* Agencies */}
      {tab === 'agencies' && (
        <div className="mt-6 space-y-3">{allAgencies.map(a => (
          <div key={a.id} className="rounded-xl border bg-white p-4 flex items-center justify-between shadow-sm">
            <div><h4 className="font-bold text-slate-900">{a.name}</h4><p className="text-xs text-slate-500">⭐ {a.rating_avg} • {a.total_reviews} reseñas • WhatsApp: {a.whatsapp}</p></div>
            <button onClick={async () => { if (await adminVerifyAgency(a.id, !a.is_verified)) adminFetchAll(); }} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${a.is_verified ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {a.is_verified ? <><ShieldCheck className="h-4 w-4" />Verificada</> : <><CheckCircle className="h-4 w-4" />Verificar</>}
            </button>
          </div>
        ))}</div>
      )}

      {/* Trips */}
      {tab === 'trips' && (
        <div className="mt-6 space-y-3">{trips.map(t => (
          <div key={t.id} className="rounded-xl border bg-white p-4 flex items-center justify-between shadow-sm">
            <div><h4 className="font-bold text-slate-900 line-clamp-1">{t.title}</h4><p className="text-xs text-slate-500">{t.departure_city} → {t.destination} • {formatDate(t.departure_date)} • ${currency(t.price)} • {t.agency?.name}</p></div>
            <button onClick={async () => { if (await adminApproveTrip(t.id, !t.is_approved)) adminFetchAll(); }} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${t.is_approved ? 'bg-emerald-50 text-emerald-700 hover:bg-rose-50 hover:text-rose-700' : 'bg-amber-50 text-amber-700 hover:bg-emerald-50 hover:text-emerald-700'}`}>
              {t.is_approved ? <><XCircle className="h-4 w-4" />Rechazar</> : <><CheckCircle className="h-4 w-4" />Aprobar</>}
            </button>
          </div>
        ))}</div>
      )}
    </div>
  );
}
