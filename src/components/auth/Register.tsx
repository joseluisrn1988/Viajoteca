import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Compass, Building2, Backpack, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [role, setRole] = useState<'traveler' | 'agency'>('traveler');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (role === 'agency' && !agencyName.trim()) {
      toast.error('El nombre de la agencia es obligatorio');
      return;
    }
    
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setBusy(true);
    const ok = await signUp(email, password, fullName, phone, role, agencyName, whatsapp);
    setBusy(false);
    if (ok) nav('/');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg"><Compass className="h-7 w-7 text-white" /></div>
          <h2 className="mt-5 text-2xl font-black text-slate-900">Crear Cuenta</h2>
          <p className="mt-1 text-sm text-slate-500">Únete a Viajoteca</p>
        </div>

        {/* Role Selector */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setRole('traveler')} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-bold transition ${role === 'traveler' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            <Backpack className="h-6 w-6" />Soy Viajero
          </button>
          <button type="button" onClick={() => setRole('agency')} className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-bold transition ${role === 'agency' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
            <Building2 className="h-6 w-6" />Soy Agencia
          </button>
        </div>

        <form onSubmit={handle} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nombre Completo</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Juan Pérez" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Teléfono</label>
              <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} placeholder="5512345678" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Correo Electrónico</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Contraseña</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
          </div>

          {role === 'agency' && (
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-bold text-emerald-600">Datos de tu Agencia</p>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Nombre Comercial</label>
                <input type="text" required value={agencyName} onChange={e => setAgencyName(e.target.value)} placeholder="Viajes Aventura MX" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">WhatsApp de Ventas</label>
                <input type="tel" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="525512345678" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
              </div>
            </div>
          )}

          <button type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            {busy ? 'Creando...' : 'Crear Cuenta'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">¿Ya tienes cuenta? <Link to="/login" className="font-bold text-emerald-600 hover:underline">Inicia sesión</Link></p>
      </div>
    </div>
  );
}