import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTrips } from '../../contexts/TripContext';
import { TRIP_CATEGORIES, DEPARTURE_CITIES, type ItineraryItem } from '../../types';
import SeatSelectorConfig from '../shared/SeatSelectorConfig';
import { Save, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TripForm() {
  const nav = useNavigate();
  const { agency } = useAuth();
  const { createTrip } = useTrips();
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departureCity, setDepartureCity] = useState('CDMX');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState<string>('Naturaleza');
  const [durationText, setDurationText] = useState('1 Día');
  const [images, setImages] = useState('');
  const [totalSeats, setTotalSeats] = useState(40);
  const [vehicleType, setVehicleType] = useState('Autobús de Turismo');
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [included, setIncluded] = useState('');
  const [notIncluded, setNotIncluded] = useState('');
  const [whatsapp, setWhatsapp] = useState(agency?.whatsapp || '');
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);
  const [itTime, setItTime] = useState('');
  const [itTitle, setItTitle] = useState('');
  const [itDesc, setItDesc] = useState('');

  const addItinerary = () => {
    if (!itTime || !itTitle) return;
    setItinerary([...itinerary, { time_or_day: itTime, title: itTitle, description: itDesc, sort_order: itinerary.length }]);
    setItTime(''); setItTitle(''); setItDesc('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency) { toast.error('No se encontró tu agencia'); return; }
    setBusy(true);
    const imageList = images ? images.split(',').map(s => s.trim()).filter(Boolean) : [];
    const result = await createTrip({
      agency_id: agency.id, title, description, departure_city: departureCity, destination,
      departure_date: departureDate, return_date: returnDate, price: Number(price), currency: 'MXN',
      images: imageList, category, duration_text: durationText, vehicle_type: vehicleType,
      total_seats: totalSeats, blocked_seats: [],
      departure_address: address, departure_instructions: instructions,
      departure_lat: null, departure_lng: null, departure_embed_url: embedUrl || null,
      whats_included: included.split('\n').filter(Boolean),
      whats_not_included: notIncluded.split('\n').filter(Boolean),
      whatsapp_number: whatsapp, is_approved: false, status: 'active',
    }, itinerary);
    setBusy(false);
    if (result) nav('/agency');
  };

  const inp = "w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none";
  const lbl = "block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-black text-slate-900">Crear Nuevo Viaje</h1>
      <p className="mt-1 text-sm text-slate-500">Completa todos los datos. Tu viaje será revisado antes de publicarse.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Basic info */}
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">Información General</h3>
          <div><label className={lbl}>Título del Viaje</label><input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={inp} placeholder="Ej. Grutas de Tolantongo" /></div>
          <div><label className={lbl}>Descripción</label><textarea required rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inp} placeholder="Describe tu viaje de forma atractiva..." /></div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div><label className={lbl}>Ciudad de Salida</label><select value={departureCity} onChange={e => setDepartureCity(e.target.value)} className={inp}>{DEPARTURE_CITIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className={lbl}>Destino</label><input type="text" required value={destination} onChange={e => setDestination(e.target.value)} className={inp} placeholder="Ej. Hidalgo" /></div>
            <div><label className={lbl}>Fecha de Salida</label><input type="date" required value={departureDate} onChange={e => setDepartureDate(e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Fecha de Retorno</label><input type="date" required value={returnDate} onChange={e => setReturnDate(e.target.value)} className={inp} /></div>
            <div><label className={lbl}>Precio (MXN)</label><input type="number" required value={price} onChange={e => setPrice(Number(e.target.value))} className={inp} /></div>
            <div><label className={lbl}>Duración</label><input type="text" required value={durationText} onChange={e => setDurationText(e.target.value)} className={inp} placeholder="Ej. 2 Días, 1 Noche" /></div>
            <div><label className={lbl}>Categoría</label><select value={category} onChange={e => setCategory(e.target.value)} className={inp}>{TRIP_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className={lbl}>WhatsApp de Ventas</label><input type="tel" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className={inp} placeholder="525512345678" /></div>
          </div>
          <div><label className={lbl}>URLs de Imágenes (separadas por coma)</label><input type="text" value={images} onChange={e => setImages(e.target.value)} className={inp} placeholder="https://img1.jpg, https://img2.jpg" /></div>
        </section>

        {/* Seat Configuration */}
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Configuración del Transporte</h3>
          <SeatSelectorConfig value={totalSeats} onChange={(seats, vehicle) => { setTotalSeats(seats); setVehicleType(vehicle); }} />
        </section>

        {/* Departure Location */}
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">Punto de Salida</h3>
          <div><label className={lbl}>Dirección</label><input type="text" required value={address} onChange={e => setAddress(e.target.value)} className={inp} /></div>
          <div><label className={lbl}>Instrucciones de Abordaje</label><input type="text" required value={instructions} onChange={e => setInstructions(e.target.value)} className={inp} placeholder="Ej. Cita a las 06:00 AM..." /></div>
          <div><label className={lbl}>Embed de Google Maps (opcional)</label><input type="text" value={embedUrl} onChange={e => setEmbedUrl(e.target.value)} className={inp + ' font-mono text-xs'} placeholder="https://www.google.com/maps/embed?..." /></div>
        </section>

        {/* Inclusions */}
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">Incluye / No Incluye</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className={lbl}>Incluido (uno por línea)</label><textarea rows={3} value={included} onChange={e => setIncluded(e.target.value)} className={inp} placeholder="Transporte redondo&#10;Entradas al parque" /></div>
            <div><label className={lbl}>No incluido (uno por línea)</label><textarea rows={3} value={notIncluded} onChange={e => setNotIncluded(e.target.value)} className={inp} placeholder="Alimentos&#10;Propinas" /></div>
          </div>
        </section>

        {/* Itinerary Builder */}
        <section className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="font-bold text-slate-900">Itinerario</h3>
          {itinerary.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto rounded-xl border border-slate-150 p-3 bg-slate-50">
              {itinerary.map((it, i) => (
                <div key={i} className="flex items-center justify-between gap-3 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                  <div><strong className="text-emerald-700">{it.time_or_day}</strong>: <span className="font-extrabold text-slate-800">{it.title}</span></div>
                  <button type="button" onClick={() => setItinerary(itinerary.filter((_, j) => j !== i))} className="text-rose-500 shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <input type="text" placeholder="Hora/Día" value={itTime} onChange={e => setItTime(e.target.value)} className={inp} />
            <input type="text" placeholder="Título" value={itTitle} onChange={e => setItTitle(e.target.value)} className={inp} />
            <input type="text" placeholder="Descripción" value={itDesc} onChange={e => setItDesc(e.target.value)} className={inp} />
          </div>
          <button type="button" onClick={addItinerary} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800"><Plus className="h-3.5 w-3.5" />Agregar parada</button>
        </section>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => nav('/agency')} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancelar</button>
          <button type="submit" disabled={busy} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700 disabled:opacity-50"><Save className="h-4 w-4" />{busy ? 'Guardando...' : 'Publicar Viaje'}</button>
        </div>
      </form>
    </div>
  );
}
