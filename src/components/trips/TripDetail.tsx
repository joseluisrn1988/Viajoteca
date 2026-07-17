import { useState } from 'react';
import type { Trip } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useTrips } from '../../contexts/TripContext';
import { ArrowLeft, Calendar, MapPin, Clock, CheckCircle2, XCircle, MessageSquare, ExternalLink, ShieldCheck, Info, Star } from 'lucide-react';
import { formatDateLong, currency } from '../../lib/utils';
import SeatSelector from '../booking/SeatSelector';
import PassengerForm from '../booking/PassengerForm';
import PaymentInstructions from '../booking/PaymentInstructions';
import { useNavigate } from 'react-router-dom';

export default function TripDetail({ trip }: { trip: Trip }) {
  const nav = useNavigate();
  const { user } = useAuth();
  const { createBooking } = useTrips();
  const [activeImg, setActiveImg] = useState(trip.images?.[0] || '');
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [step, setStep] = useState<'seats' | 'passengers' | 'payment'>('seats');
  const [passengers, setPassengers] = useState<{ name: string; seat: number }[]>([]);
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const avail = trip.total_seats - (trip.blocked_seats?.length || 0);

  const handleSeatToggle = (n: number) => {
    const updated = selectedSeats.includes(n) ? selectedSeats.filter(s => s !== n) : [...selectedSeats, n];
    setSelectedSeats(updated);
    setPassengers(updated.map((s, i) => ({ name: passengers[i]?.name || '', seat: s })));
  };

  const handlePassengerChange = (i: number, name: string) => {
    const u = [...passengers]; u[i] = { ...u[i], name }; setPassengers(u);
  };

  const handlePassengerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passengers.some(p => !p.name.trim()) || !contact.name || !contact.phone || !contact.email) return;
    setStep('payment');
  };

  const handleConfirm = async () => {
    if (user) {
      await createBooking({ trip_id: trip.id, user_id: user.id, selected_seats: selectedSeats, passengers, contact_name: contact.name, contact_phone: contact.phone, contact_email: contact.email, total_price: selectedSeats.length * trip.price, status: 'pending' });
    }
  };

  const handleOperatorChat = () => {
    const text = `Hola! Estoy viendo el viaje *${trip.title}* con salida de *${trip.departure_city}* el *${formatDateLong(trip.departure_date)}* en Viajoteca. Tengo algunas dudas.`;
    window.open(`https://wa.me/${trip.whatsapp_number}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-slate-50 pb-24">
      <div className="sticky top-16 z-30 bg-white/95 border-b border-slate-100 py-4 shadow-xs backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button onClick={() => nav('/')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-4 w-4" />Catálogo</button>
          {trip.agency?.is_verified && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100 flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />Verificada</span>}
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Gallery */}
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100">
                <img src={activeImg || trip.images?.[0] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'} alt={trip.title} className="h-full w-full object-cover" />
              </div>
              {trip.images && trip.images.length > 1 && <div className="mt-4 flex gap-3 overflow-x-auto pb-2">{trip.images.map((img, i) => <button key={i} onClick={() => setActiveImg(img)} className={`h-20 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition ${activeImg === img ? 'border-emerald-500' : 'border-transparent hover:scale-95'}`}><img src={img} alt="" className="h-full w-full object-cover" /></button>)}</div>}
            </div>
            {/* Info */}
            <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <div className="flex flex-wrap gap-2"><span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">{trip.category}</span><span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{trip.duration_text}</span><span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{trip.vehicle_type}</span></div>
                <h1 className="mt-4 text-2xl font-black text-slate-900 sm:text-3xl leading-tight">{trip.title}</h1>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5 font-medium"><MapPin className="h-4 w-4 text-emerald-500" />{trip.departure_city} → <strong>{trip.destination}</strong></span>
                  <span className="flex items-center gap-1.5 font-medium"><Calendar className="h-4 w-4 text-emerald-500" />{formatDateLong(trip.departure_date)}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-6"><h3 className="text-lg font-bold text-slate-900">Sobre este viaje</h3><p className="mt-3 text-slate-600 leading-relaxed whitespace-pre-line">{trip.description}</p></div>
            </div>
            {/* Itinerary */}
            {trip.itinerary_items && trip.itinerary_items.length > 0 && (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900">Itinerario</h3>
                <div className="mt-8 relative border-l-2 border-emerald-100 pl-6 ml-3 space-y-8">
                  {trip.itinerary_items.map((it, i) => (
                    <div key={i} className="relative"><div className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-emerald-50" />
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md"><Clock className="h-3 w-3" />{it.time_or_day}</span>
                      <h4 className="mt-2 text-base font-extrabold text-slate-950">{it.title}</h4>
                      {it.description && <p className="mt-1 text-sm text-slate-600 leading-relaxed">{it.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Inclusions */}
            <div className="grid gap-6 md:grid-cols-2">
              {trip.whats_included && trip.whats_included.length > 0 && (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><h4 className="flex items-center gap-2 text-base font-bold text-slate-900"><CheckCircle2 className="h-5 w-5 text-emerald-500" />Incluido</h4><ul className="mt-4 space-y-2">{trip.whats_included.map((item, i) => <li key={i} className="flex gap-2.5 text-sm text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />{item}</li>)}</ul></div>
              )}
              {trip.whats_not_included && trip.whats_not_included.length > 0 && (
                <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"><h4 className="flex items-center gap-2 text-base font-bold text-slate-900"><XCircle className="h-5 w-5 text-rose-500" />No incluido</h4><ul className="mt-4 space-y-2">{trip.whats_not_included.map((item, i) => <li key={i} className="flex gap-2.5 text-sm text-slate-600"><span className="h-1.5 w-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />{item}</li>)}</ul></div>
              )}
            </div>
            {/* Pickup Points */}
            {(trip.pickup_points && trip.pickup_points.length > 0) || trip.departure_address ? (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Puntos de Salida / Recogida</h3>
                  {(trip.pickup_points?.length || 0) > 1 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{trip.pickup_points?.length} ubicaciones</span>}
                </div>

                {/* Pickup point selector if multiple */}
                <div>
                  {trip.pickup_points && trip.pickup_points.length > 0 ? (
                    <div className="space-y-6">
                      {trip.pickup_points.length > 1 && (
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                          {trip.pickup_points.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => {
                                const el = document.getElementById(`pickup-${i}`);
                                el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
                              }}
                              className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            >
                              Punto {i + 1}
                            </button>
                          ))}
                        </div>
                      )}
                      
                      <div className="space-y-12 divide-y divide-slate-100">
                        {trip.pickup_points.map((pp, idx) => (
                          <div key={pp.id || idx} id={`pickup-${idx}`} className={idx > 0 ? "pt-10" : ""}>
                            <div className="flex flex-col gap-4">
                              <div className="flex items-start gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-black text-emerald-600 border border-emerald-100 shadow-sm">{idx + 1}</div>
                                <div className="space-y-4 flex-1">
                                  <div>
                                    <strong className="text-base text-slate-900 block font-black leading-tight">{pp.address}</strong>
                                    {pp.instructions && (
                                      <div className="mt-2.5 rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                                        <p className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                                          <Info className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                          {pp.instructions}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {pp.embed_url && (
                                    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                                      <iframe title={`Mapa punto ${idx + 1}`} src={pp.embed_url} width="100%" height="100%" style={{ border: 0 }} loading="lazy" />
                                    </div>
                                  )}
                                  
                                  <div className="flex justify-end">
                                    <a 
                                      href={pp.lat && pp.lng 
                                        ? `https://www.google.com/maps/search/?api=1&query=${pp.lat},${pp.lng}`
                                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pp.address)}`
                                      } 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                                    >
                                      Ver en Google Maps <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Fallback for legacy trips */
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-150 bg-slate-50 p-4 flex gap-4 text-sm text-slate-600"><MapPin className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" /><div><strong>{trip.departure_address}</strong></div></div>
                      {trip.departure_instructions && <div className="rounded-2xl border border-slate-150 bg-slate-50 p-4 flex gap-4 text-sm text-slate-600"><Info className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" /><div>{trip.departure_instructions}</div></div>}
                      {trip.departure_embed_url && <div className="aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200"><iframe title="Mapa" src={trip.departure_embed_url} width="100%" height="100%" style={{ border: 0 }} loading="lazy" /></div>}
                      {trip.departure_lat && trip.departure_lng && <a href={`https://www.google.com/maps/search/?api=1&query=${trip.departure_lat},${trip.departure_lng}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline">Abrir en Google Maps <ExternalLink className="h-3.5 w-3.5" /></a>}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
            {/* Agency info */}
            {trip.agency && (
              <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  {trip.agency.logo_url && <img src={trip.agency.logo_url} alt="" className="h-16 w-16 rounded-2xl object-cover border-2 border-slate-100 shadow-sm" />}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Operado por</span>
                    <h4 className="text-lg font-black text-slate-900">{trip.agency.name}</h4>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-0.5 text-amber-500 font-bold"><Star className="h-3.5 w-3.5 fill-amber-500" /> {trip.agency.rating_avg || 'Nuevo'}</span>
                      <span>{trip.agency.total_reviews} reseñas</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleOperatorChat} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"><MessageSquare className="h-4 w-4 text-slate-500" />Contactar</button>
              </div>
            )}
          </div>
          {/* Right Sidebar: Booking Widget */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-32 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-100/50 space-y-6">
              <div className="flex items-end justify-between border-b border-slate-100 pb-5">
                <div><span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Precio</span><div className="mt-1 flex items-baseline gap-1.5"><span className="text-3xl font-black text-slate-950">${currency(trip.price)}</span><span className="text-xs font-semibold text-slate-500">{trip.currency}</span></div></div>
                <div className="text-right"><span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Disponibles</span><span className={`text-base font-extrabold ${avail <= 5 ? 'text-rose-500' : 'text-slate-800'}`}>{avail} / {trip.total_seats}</span></div>
              </div>
              {/* Steps nav */}
              {selectedSeats.length > 0 && (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-1">
                  {['seats', 'passengers', 'payment'].map((s, i) => (
                    <button key={s} onClick={() => { if (s === 'seats') setStep('seats'); }} className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${step === s ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>{i + 1}. {s === 'seats' ? 'Asientos' : s === 'passengers' ? 'Datos' : 'Pago'}</button>
                  ))}
                </div>
              )}
              {step === 'seats' && (
                <div className="space-y-4">
                  <SeatSelector totalSeats={trip.total_seats} blockedSeats={trip.blocked_seats || []} selected={selectedSeats} onToggle={handleSeatToggle} />
                  {selectedSeats.length > 0 && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800"><span>Asientos:</span><span>{selectedSeats.sort((a, b) => a - b).join(', ')}</span></div>
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800"><span>Total ({selectedSeats.length} personas):</span><span>${currency(selectedSeats.length * trip.price)} MXN</span></div>
                      <button onClick={() => { if (!user) { nav('/login'); return; } setStep('passengers'); }} className="w-full mt-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md shadow-emerald-200 hover:bg-emerald-700">{user ? 'Continuar' : 'Inicia sesión para reservar'}</button>
                    </div>
                  )}
                </div>
              )}
              {step === 'passengers' && <PassengerForm seats={selectedSeats.sort((a, b) => a - b)} passengers={passengers} contact={contact} onPassengerChange={handlePassengerChange} onContactChange={setContact} onSubmit={handlePassengerSubmit} onBack={() => setStep('seats')} />}
              {step === 'payment' && <PaymentInstructions seats={selectedSeats} price={trip.price} tripTitle={trip.title} tripDate={formatDateLong(trip.departure_date)} whatsapp={trip.whatsapp_number || ''} contactName={contact.name} passengers={passengers} contactPhone={contact.phone} contactEmail={contact.email} onBack={() => setStep('passengers')} onConfirm={handleConfirm} />}
              <div className="border-t border-slate-100 pt-5"><button onClick={handleOperatorChat} className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600 hover:bg-slate-50"><MessageSquare className="h-4 w-4 text-slate-400" />¿Dudas? Habla con un asesor</button></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}