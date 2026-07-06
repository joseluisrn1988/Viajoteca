interface Passenger { name: string; seat: number; }
interface Contact { name: string; phone: string; email: string; }
interface Props { seats: number[]; passengers: Passenger[]; contact: Contact; onPassengerChange: (i: number, name: string) => void; onContactChange: (c: Contact) => void; onSubmit: (e: React.FormEvent) => void; onBack: () => void; }

export default function PassengerForm({ seats, passengers, contact, onPassengerChange, onContactChange, onSubmit, onBack }: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div><h4 className="font-extrabold text-slate-900 text-sm">Datos de pasajeros</h4><p className="text-xs text-slate-500">Completa la información para el pase de lista.</p></div>
      <div className="space-y-3 border-b border-slate-100 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Responsable</span>
        <input type="text" required placeholder="Nombre completo" value={contact.name} onChange={e => onContactChange({ ...contact, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
        <div className="grid gap-3 sm:grid-cols-2">
          <input type="tel" required placeholder="WhatsApp" value={contact.phone} onChange={e => onContactChange({ ...contact, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
          <input type="email" required placeholder="Correo" value={contact.email} onChange={e => onContactChange({ ...contact, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
        </div>
      </div>
      <div className="space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pasajeros</span>
        {seats.map((seat, i) => (
          <div key={seat} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700 border border-emerald-100">{seat}</div>
            <input type="text" required placeholder={`Nombre (Asiento ${seat})`} value={passengers[i]?.name || ''} onChange={e => onPassengerChange(i, e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none" />
          </div>
        ))}
      </div>
      <div className="flex gap-2.5 pt-2">
        <button type="button" onClick={onBack} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Atrás</button>
        <button type="submit" className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700">Continuar</button>
      </div>
    </form>
  );
}
