interface Props { totalSeats: number; blockedSeats: number[]; selected: number[]; onToggle: (seat: number) => void; }

export default function SeatSelector({ totalSeats, blockedSeats, selected, onToggle }: Props) {
  return (
    <div className="space-y-4">
      <div><h4 className="font-extrabold text-slate-900 text-sm">Selecciona tus asientos</h4><p className="text-xs text-slate-500">Haz clic para elegir tus lugares en el transporte.</p></div>
      <div className="rounded-2xl border border-slate-150 bg-slate-50/50 p-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Frente 🚌</span>
          <span className="text-xs font-bold text-slate-800">{totalSeats} lugares</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5 justify-items-center">
          {Array.from({ length: totalSeats }).map((_, i) => {
            const n = i + 1;
            const blocked = blockedSeats.includes(n);
            const sel = selected.includes(n);
            return (
              <button key={n} disabled={blocked} onClick={() => onToggle(n)}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold transition-all ${blocked ? 'bg-slate-100 text-slate-350 cursor-not-allowed border border-slate-200' : sel ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-105 border border-emerald-600' : 'bg-white text-slate-800 border border-slate-300 hover:border-slate-500 hover:bg-slate-50'}`}>
                {n}
                {blocked && <div className="absolute inset-0 flex items-center justify-center"><div className="h-full w-0.5 rotate-45 bg-slate-300/60" /></div>}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex items-center justify-around border-t border-slate-200 pt-3 text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-md border border-slate-300 bg-white" /> Disponible</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-md bg-emerald-600" /> Elegido</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-md bg-slate-100 border border-slate-200" /> Ocupado</span>
        </div>
      </div>
    </div>
  );
}
