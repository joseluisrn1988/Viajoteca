import { useState } from 'react';
import { SEAT_PRESETS, VEHICLE_SUGGESTIONS } from '../../types';

interface Props { value: number; onChange: (seats: number, vehicle: string) => void; }

export default function SeatSelectorConfig({ value, onChange }: Props) {
  const [custom, setCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const handlePreset = (n: number) => {
    setCustom(false);
    onChange(n, VEHICLE_SUGGESTIONS[n] || 'Autobús');
  };

  const handleCustom = (v: string) => {
    setCustomValue(v);
    const n = parseInt(v);
    if (n > 0 && n <= 60) onChange(n, 'Personalizado');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Número de Asientos del Transporte</label>
        <p className="text-[11px] text-slate-500 mb-3">Selecciona la capacidad de tu vehículo o ingresa un número personalizado.</p>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {SEAT_PRESETS.map(n => (
          <button key={n} type="button" onClick={() => handlePreset(n)}
            className={`flex flex-col items-center rounded-xl border-2 p-2.5 transition ${value === n && !custom ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
            <span className="text-lg font-black">{n}</span>
            <span className="text-[9px] font-semibold text-slate-400 leading-tight text-center">{VEHICLE_SUGGESTIONS[n] || 'Vehículo'}</span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setCustom(true)}
          className={`rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition ${custom ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
          Personalizado
        </button>
        {custom && (
          <input type="number" min="1" max="60" placeholder="Ej. 36" value={customValue} onChange={e => handleCustom(e.target.value)}
            className="w-24 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold focus:border-emerald-500 focus:outline-none" />
        )}
      </div>
      {value > 0 && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-xs font-semibold text-emerald-700">
          ✅ Configuración: <strong>{value} asientos</strong> • El mapa de asientos se generará automáticamente en la ficha del viaje.
        </div>
      )}
      {/* Mini preview */}
      {value > 0 && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Vista previa del mapa</p>
          <div className="grid grid-cols-4 gap-1 max-w-[200px]">
            {Array.from({ length: Math.min(value, 20) }).map((_, i) => (
              <div key={i} className="h-6 w-6 rounded bg-white border border-slate-300 flex items-center justify-center text-[8px] font-bold text-slate-500">{i + 1}</div>
            ))}
            {value > 20 && <div className="col-span-4 text-center text-[10px] text-slate-400 font-semibold">... y {value - 20} más</div>}
          </div>
        </div>
      )}
    </div>
  );
}
