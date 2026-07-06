import { Sparkles, Building, CreditCard, MessageSquare } from 'lucide-react';
import { currency } from '../../lib/utils';

interface Props { seats: number[]; price: number; tripTitle: string; tripDate: string; whatsapp: string; contactName: string; passengers: { name: string; seat: number }[]; contactPhone: string; contactEmail: string; onBack: () => void; onConfirm: () => void; }

export default function PaymentInstructions({ seats, price, tripTitle, tripDate, whatsapp, contactName, passengers, contactPhone, contactEmail, onBack, onConfirm }: Props) {
  const total = seats.length * price;

  const handleWhatsApp = () => {
    const seatsText = seats.sort((a, b) => a - b).join(', ');
    const passText = passengers.map((p, i) => `Pasajero ${i + 1}: ${p.name}`).join('%0A');
    const text = `*Nueva Reserva en Viajoteca*%0A%0A*Viaje:* ${tripTitle}%0A*Fecha:* ${tripDate}%0A*Asientos:* ${seatsText}%0A*Pasajeros:*%0A${passText}%0A%0A*Contacto:*%0A• ${contactName}%0A• ${contactPhone}%0A• ${contactEmail}%0A%0A*Total:* $${currency(total)} MXN%0A%0A_Vengo de Viajoteca, adjunto comprobante de pago._`;
    window.open(`https://wa.me/${whatsapp}?text=${text}`, '_blank');
    onConfirm();
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><Sparkles className="h-6 w-6" /></div>
        <h4 className="mt-3 font-extrabold text-slate-900 text-sm">Instrucciones de Pago</h4>
      </div>
      <div className="rounded-2xl border border-slate-150 bg-slate-50/70 p-4 space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs"><Building className="h-4 w-4 text-emerald-600" />Transferencia (SPEI)</div>
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex justify-between"><span>Banco:</span><strong>BBVA México</strong></div>
          <div className="flex justify-between"><span>Beneficiario:</span><strong>Viajes Seguros S.A de C.V</strong></div>
          <div className="flex justify-between"><span>CLABE:</span><strong className="font-mono">0121 8001 2345 6789 01</strong></div>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-150 bg-slate-50/70 p-4 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-xs"><CreditCard className="h-4 w-4 text-emerald-600" />Depósito OXXO</div>
        <div className="flex justify-between text-xs text-slate-600"><span>Tarjeta:</span><strong className="font-mono">4152 3132 4545 6789</strong></div>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/20 p-4 text-xs font-semibold text-emerald-800 space-y-2">
        <div className="flex justify-between"><span>Pasajeros:</span><span>{seats.length}</span></div>
        <div className="flex justify-between"><span>Asientos:</span><span>{seats.sort((a, b) => a - b).join(', ')}</span></div>
        <div className="flex justify-between font-extrabold text-sm text-slate-900 border-t border-emerald-100/50 pt-2"><span>Total:</span><span className="text-emerald-700">${currency(total)} MXN</span></div>
      </div>
      <button onClick={handleWhatsApp} className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700">
        <MessageSquare className="h-4 w-4" />Enviar reserva por WhatsApp
      </button>
      <button onClick={onBack} className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Atrás</button>
    </div>
  );
}
