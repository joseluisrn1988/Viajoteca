import { Star, ShieldCheck } from 'lucide-react';
import type { Agency } from '../../types';

export default function AgencyProfile({ agency }: { agency: Agency }) {
  return (
    <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-4">
        {agency.logo_url && <img src={agency.logo_url} alt="" className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" />}
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900">{agency.name}</h3>
            {agency.is_verified && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700"><ShieldCheck className="h-3.5 w-3.5" />Verificada</span>}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-0.5 text-amber-500 font-bold"><Star className="h-3.5 w-3.5 fill-amber-500" /> {agency.rating_avg || 'Nuevo'}</span>
            <span>{agency.total_reviews} reseñas</span>
          </div>
          {agency.description && <p className="mt-2 text-sm text-slate-600 max-w-md">{agency.description}</p>}
        </div>
      </div>
    </div>
  );
}
