import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Compass, LogOut, LayoutDashboard, User, LogIn } from 'lucide-react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md shadow-emerald-100"><Compass className="h-5 w-5 text-white" /></div>
          <div className="text-left">
            <span className="block text-xl font-extrabold tracking-tight text-slate-900">Viajo<span className="text-emerald-500">teca</span></span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">Salidas Cerca de Ti</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {user && profile ? (
            <>
              {profile.role === 'agency' && (
                <Link to="/agency" className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"><LayoutDashboard className="h-4 w-4" /><span className="hidden sm:inline">Mi Panel</span></Link>
              )}
              <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                <User className="h-4 w-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{profile.full_name || profile.email}</span>
              </div>
              <button onClick={async () => { await signOut(); nav('/'); }} className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition"><LogOut className="h-4 w-4" /></button>
            </>
          ) : (
            <>
              <Link to="/login" className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"><LogIn className="h-4 w-4" />Entrar</Link>
              <Link to="/register" className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition">Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
