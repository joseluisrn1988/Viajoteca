import { Compass, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white py-12 text-slate-500 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-md"><Compass className="h-4 w-4 text-white" /></div>
              <span className="text-lg font-black text-slate-900">Viajo<span className="text-emerald-500">teca</span></span>
            </div>
            <p className="text-xs leading-relaxed max-w-sm text-slate-400">La plataforma de confianza para descubrir escapadas y viajes organizados con salida desde tu ciudad.</p>
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 mb-3.5">Navegación</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-emerald-500 transition">Catálogo de Viajes</Link></li>
              <li><Link to="/register" className="hover:text-emerald-500 transition">Registrar Agencia</Link></li>
              <li><Link to="/login" className="hover:text-emerald-500 transition">Iniciar Sesión</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-900 mb-3.5">Contacto</h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-400"><Mail className="h-3.5 w-3.5" />soporte@viajoteca.com</div>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">© 2026 Viajoteca. Todos los derechos reservados.</div>
      </div>
    </footer>
  );
}
