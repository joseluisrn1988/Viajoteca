import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Compass } from 'lucide-react';
import SocialLoginButtons from './SocialLoginButtons';

export default function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const ok = await signIn(email, password);
    setBusy(false);
    if (ok) nav('/');
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg">
            <Compass className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-5 text-2xl font-black text-slate-900">Iniciar Sesión</h2>
          <p className="mt-1 text-sm text-slate-500">Accede a tu cuenta en Viajoteca</p>
        </div>

        {/* Social Login */}
        <div className="mt-6">
          <SocialLoginButtons />
        </div>

        <form onSubmit={handle} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Correo Electrónico</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Contraseña</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-sm focus:border-emerald-500 focus:outline-none" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
            </div>
          </div>
          <button type="submit" disabled={busy} className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:opacity-50">
            <LogIn className="h-4 w-4" />{busy ? 'Entrando...' : 'Entrar con correo'}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">¿No tienes cuenta? <Link to="/register" className="font-bold text-emerald-600 hover:underline">Regístrate aquí</Link></p>
      </div>
    </div>
  );
}
