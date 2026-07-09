import { useState, useEffect } from 'react';
import { Trip, ItineraryItem } from '../../types/travel';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Compass,
  DollarSign,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  Check,
  XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminPanelProps {
  trips: Trip[];
  onAddTrip: (trip: Trip) => void;
  onUpdateTrip: (trip: Trip) => void;
  onDeleteTrip: (id: string) => void;
  onResetToDefault: () => void;
}

export default function AdminPanel({
  trips: initialTrips,
  onAddTrip,
  onUpdateTrip,
  onDeleteTrip,
  onResetToDefault,
}: AdminPanelProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [activeTab, setActiveTab] = useState<'trips' | 'stats' | 'pending'>('trips');
  const [pendingTrips, setPendingTrips] = useState<Trip[]>([]);

  // Form States
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDepartureCity, setFormDepartureCity] = useState('CDMX');
  const [formDestination, setFormDestination] = useState('');
  const [formDepartureDate, setFormDepartureDate] = useState('2026-05-15');
  const [formReturnDate, setFormReturnDate] = useState('2026-05-17');
  const [formPrice, setFormPrice] = useState(1500);
  const [formImages, setFormImages] = useState('');
  const [formCategory, setFormCategory] = useState<Trip['category']>('Naturaleza');
  const [formDurationText, setFormDurationText] = useState('1 Día');
  
  // Departure Location Form States
  const [formAddress, setFormAddress] = useState('');
  const [formInstructions, setFormInstructions] = useState('');
  const [formEmbedUrl, setFormEmbedUrl] = useState('');
  
  // Inclusions Form States
  const [formWhatsIncluded, setFormWhatsIncluded] = useState('');
  const [formWhatsNotIncluded, setFormWhatsNotIncluded] = useState('');
  
  // Dynamic Itinerary Items State
  const [formItinerary, setFormItinerary] = useState<ItineraryItem[]>([
    { timeOrDay: '08:00 AM', title: 'Punto de reunión', description: 'Reunión e inicio del trayecto.' }
  ]);
  const [itTime, setItTime] = useState('');
  const [itTitle, setItTitle] = useState('');
  const [itDesc, setItDesc] = useState('');

  // Agency Info Form States
  const [formAgencyName, setFormAgencyName] = useState('Agencia Local');
  const [formAgencyLogo, setFormAgencyLogo] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80');
  const [formAgencyPhone, setFormAgencyPhone] = useState('525512345678');

  // Interactive seat blocking mode
  const [selectedTripForSeats, setSelectedTripForSeats] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync trips when props change
  useEffect(() => {
    setTrips(initialTrips);
    // Filter pending trips (is_approved = false)
    const pending = initialTrips.filter(t => t.is_approved === false);
    setPendingTrips(pending);
  }, [initialTrips]);

  // Stats calculation
  const totalRevenue = trips.reduce((acc, t) => {
    return acc + (t.blockedSeats?.length || 0) * t.price;
  }, 0);
  const totalBookedSeats = trips.reduce((acc, t) => acc + (t.blockedSeats?.length || 0), 0);
  const totalCapacity = trips.reduce((acc, t) => acc + (t.totalSeats || 0), 0);

  // ✅ FUNCIÓN CORREGIDA PARA APROBAR VIAJES
  const handleApproveTrip = async (tripId: string) => {
    if (!isSupabaseConfigured) {
      toast.error('❌ Supabase no está configurado');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Actualizar en Supabase
      const { error } = await supabase
        .from('trips')
        .update({ is_approved: true })
        .eq('id', tripId);

      if (error) throw error;

      // 2. Actualizar el estado local
      const updatedTrips = trips.map(trip =>
        trip.id === tripId ? { ...trip, is_approved: true } : trip
      );
      setTrips(updatedTrips);
      
      // 3. Actualizar la lista de pendientes
      setPendingTrips(prev => prev.filter(t => t.id !== tripId));

      // 4. Notificar al padre
      const approvedTrip = trips.find(t => t.id === tripId);
      if (approvedTrip) {
        onUpdateTrip({ ...approvedTrip, is_approved: true });
      }

      toast.success('✅ Viaje aprobado y ahora es visible para los viajeros');
    } catch (error) {
      console.error('Error al aprobar:', error);
      toast.error('❌ Error al aprobar el viaje. Revisa la consola.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FUNCIÓN PARA RECHAZAR VIAJES (opcional)
  const handleRejectTrip = async (tripId: string) => {
    if (!isSupabaseConfigured) {
      toast.error('❌ Supabase no está configurado');
      return;
    }

    if (!confirm('¿Estás seguro de rechazar este viaje? La agencia será notificada.')) {
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('trips')
        .update({ status: 'rejected' })
        .eq('id', tripId);

      if (error) throw error;

      setPendingTrips(prev => prev.filter(t => t.id !== tripId));
      toast.success('🗑️ Viaje rechazado');
    } catch (error) {
      console.error('Error al rechazar:', error);
      toast.error('❌ Error al rechazar el viaje');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormDepartureCity('CDMX');
    setFormDestination('');
    setFormDepartureDate('2026-05-15');
    setFormReturnDate('2026-05-17');
    setFormPrice(1500);
    setFormImages('');
    setFormCategory('Naturaleza');
    setFormDurationText('1 Día');
    setFormAddress('');
    setFormInstructions('');
    setFormEmbedUrl('');
    setFormWhatsIncluded('');
    setFormWhatsNotIncluded('');
    setFormItinerary([{ timeOrDay: '08:00 AM', title: 'Punto de reunión', description: 'Reunión e inicio del trayecto.' }]);
    setFormAgencyName('Agencia Local');
    setFormAgencyLogo('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80');
    setFormAgencyPhone('525512345678');
    setEditingTrip(null);
  };

  const handleOpenAddForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (trip: Trip) => {
    setEditingTrip(trip);
    setFormTitle(trip.title);
    setFormDescription(trip.description);
    setFormDepartureCity(trip.departureCity);
    setFormDestination(trip.destination);
    setFormDepartureDate(trip.departureDate);
    setFormReturnDate(trip.returnDate);
    setFormPrice(trip.price);
    setFormImages(trip.images.join(', '));
    setFormCategory(trip.category);
    setFormDurationText(trip.durationText);
    setFormAddress(trip.departureLocation?.address || '');
    setFormInstructions(trip.departureLocation?.instructions || '');
    setFormEmbedUrl(trip.departureLocation?.embedUrl || '');
    setFormWhatsIncluded(trip.whatsIncluded.join('\n'));
    setFormWhatsNotIncluded(trip.whatsNotIncluded.join('\n'));
    setFormItinerary(trip.itinerary || []);
    setFormAgencyName(trip.agency?.name || 'Agencia Local');
    setFormAgencyLogo(trip.agency?.logo || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80');
    setFormAgencyPhone(trip.agency?.phone || '525512345678');
    setIsFormOpen(true);
  };

  const handleAddItineraryItem = () => {
    if (!itTime || !itTitle) {
      toast.error('La hora/día y el título del itinerario son obligatorios.');
      return;
    }
    setFormItinerary([...formItinerary, { timeOrDay: itTime, title: itTitle, description: itDesc }]);
    setItTime('');
    setItTitle('');
    setItDesc('');
  };

  const handleRemoveItineraryItem = (idx: number) => {
    setFormItinerary(formItinerary.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const imageList = formImages
      ? formImages.split(',').map((img) => img.trim())
      : ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'];

    const newTrip: Trip = {
      id: editingTrip ? editingTrip.id : `trip-${Date.now()}`,
      title: formTitle,
      description: formDescription,
      departureCity: formDepartureCity,
      destination: formDestination,
      departureDate: formDepartureDate,
      returnDate: formReturnDate,
      price: Number(formPrice),
      currency: 'MXN',
      images: imageList,
      category: formCategory,
      durationText: formDurationText,
      departureLocation: {
        address: formAddress,
        coordinates: { lat: 19.43, lng: -99.13 },
        instructions: formInstructions,
        embedUrl: formEmbedUrl || undefined,
      },
      whatsIncluded: formWhatsIncluded.split('\n').filter((item) => item.trim() !== ''),
      whatsNotIncluded: formWhatsNotIncluded.split('\n').filter((item) => item.trim() !== ''),
      itinerary: formItinerary,
      agency: {
        name: formAgencyName,
        logo: formAgencyLogo,
        rating: 4.9,
        totalTrips: 10,
        isVerified: true,
        phone: formAgencyPhone,
      },
      totalSeats: editingTrip ? editingTrip.totalSeats : 40,
      blockedSeats: editingTrip ? editingTrip.blockedSeats : [],
      whatsappNumber: formAgencyPhone,
      is_approved: editingTrip ? editingTrip.is_approved : false,
      status: 'active',
    };

    if (editingTrip) {
      onUpdateTrip(newTrip);
      toast.success('✅ Viaje actualizado correctamente');
    } else {
      onAddTrip(newTrip);
      toast.success('✅ Viaje creado. Pendiente de aprobación.');
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleToggleSeatBlock = (tripId: string, seatNumber: number) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    let updatedBlocked = [...(trip.blockedSeats || [])];
    if (updatedBlocked.includes(seatNumber)) {
      updatedBlocked = updatedBlocked.filter((s) => s !== seatNumber);
    } else {
      updatedBlocked.push(seatNumber);
    }

    const updatedTrip = { ...trip, blockedSeats: updatedBlocked };
    onUpdateTrip(updatedTrip);
    
    // Update local state
    setTrips(prev => prev.map(t => t.id === tripId ? updatedTrip : t));
    
    if (selectedTripForSeats?.id === tripId) {
      setSelectedTripForSeats(updatedTrip);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            🛡️ Panel de Administración
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona viajes, aprueba publicaciones de agencias y administra la plataforma.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetToDefault}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Restaurar Valores por Defecto
          </button>
          <button
            onClick={handleOpenAddForm}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" />
            Crear Nuevo Viaje
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('trips')}
          className={`border-b-2 px-4 py-3.5 text-sm font-bold transition-all ${
            activeTab === 'trips'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Todos los viajes ({trips.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`border-b-2 px-4 py-3.5 text-sm font-bold transition-all relative ${
            activeTab === 'pending'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Pendientes de aprobar
          {pendingTrips.length > 0 && (
            <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {pendingTrips.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`border-b-2 px-4 py-3.5 text-sm font-bold transition-all ${
            activeTab === 'stats'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Métricas y Finanzas
        </button>
      </div>

      {/* PENDING TRIPS VIEW */}
      {activeTab === 'pending' && (
        <div className="mt-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">✋ Viajes pendientes de aprobación</h2>
          {pendingTrips.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="mt-4 text-lg font-bold text-slate-900">¡Todo aprobado!</h3>
              <p className="text-sm text-slate-500">No hay viajes pendientes de revisión.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingTrips.map((trip) => (
                <div key={trip.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 line-clamp-1">{trip.title}</h4>
                      <p className="text-xs text-slate-500">Agencia: {trip.agency?.name || 'Desconocida'}</p>
                    </div>
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">
                      Pendiente
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {trip.departureCity} → {trip.destination}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(trip.departureDate).toLocaleDateString('es-MX')}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    ${trip.price.toLocaleString('es-MX')} MXN
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleApproveTrip(trip.id)}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      {isLoading ? 'Procesando...' : 'Aprobar'}
                    </button>
                    <button
                      onClick={() => handleRejectTrip(trip.id)}
                      disabled={isLoading}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Rechazar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STATS VIEW */}
      {activeTab === 'stats' && (
        <div className="mt-8 space-y-8">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
                <DollarSign className="h-7 w-7" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Ventas Totales</span>
                <strong className="mt-1 block text-2xl font-black text-slate-900">${totalRevenue.toLocaleString('es-MX')} MXN</strong>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
                <TrendingUp className="h-7 w-7" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Porcentaje de Ocupación</span>
                <strong className="mt-1 block text-2xl font-black text-slate-900">
                  {totalCapacity > 0 ? Math.round((totalBookedSeats / totalCapacity) * 100) : 0}% 
                  <span className="text-xs font-semibold text-slate-500"> ({totalBookedSeats}/{totalCapacity} asientos)</span>
                </strong>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
                <Compass className="h-7 w-7" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Tours Activos</span>
                <strong className="mt-1 block text-2xl font-black text-slate-900">{trips.length} destinos</strong>
              </div>
            </div>
          </div>

          {/* Mini-table of detailed passenger tracking */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Desglose de Ventas por Destino</h4>
                <p className="text-xs text-slate-500">Consulta los asientos ocupados y el acumulado en caja para cada viaje.</p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                <FileSpreadsheet className="h-4 w-4 text-slate-400" />
                Actualizado en tiempo real
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3.5">Título del Viaje</th>
                    <th className="px-4 py-3.5">Operador</th>
                    <th className="px-4 py-3.5">Ocupación</th>
                    <th className="px-4 py-3.5">Precio Unitario</th>
                    <th className="px-4 py-3.5">Total Recaudado</th>
                    <th className="px-4 py-3.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trips.map((t) => {
                    const rev = (t.blockedSeats?.length || 0) * t.price;
                    const pct = t.totalSeats > 0 ? Math.round(((t.blockedSeats?.length || 0) / t.totalSeats) * 100) : 0;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3.5 font-bold text-slate-800">{t.title}</td>
                        <td className="px-4 py-3.5 font-semibold text-slate-600">{t.agency?.name || 'N/A'}</td>
                        <td className="px-4 py-3.5 text-slate-700">
                          {t.blockedSeats?.length || 0} / {t.totalSeats} asientos ({pct}%)
                        </td>
                        <td className="px-4 py-3.5 font-mono">${t.price} MXN</td>
                        <td className="px-4 py-3.5 font-bold text-emerald-600 font-mono">${rev.toLocaleString('es-MX')} MXN</td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            t.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {t.is_approved ? (
                              <>
                                <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Aprobado
                              </>
                            ) : (
                              <>
                                <Clock className="h-3.5 w-3.5 text-amber-500" /> Pendiente
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TRIPS MANAGEMENT TABLE */}
      {activeTab === 'trips' && (
        <div className="mt-8 space-y-6">
          <div className="rounded-3xl border border-slate-150 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-150">
                <tr>
                  <th className="px-6 py-4">Información del Viaje</th>
                  <th className="px-6 py-4">Salida & Fechas</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4">Asientos Vendidos / Total</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trips.map((t) => {
                  const pct = t.totalSeats > 0 ? Math.round(((t.blockedSeats?.length || 0) / t.totalSeats) * 100) : 0;
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img src={t.images?.[0] || 'https://via.placeholder.com/50'} alt="" className="h-12 w-12 rounded-lg object-cover bg-slate-100 shrink-0" />
                          <div>
                            <h4 className="font-extrabold text-slate-900 text-sm line-clamp-1">{t.title}</h4>
                            <span className="inline-flex rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 mt-1">
                              {t.category}
                            </span>
                            <span className="text-[11px] text-slate-400 ml-2 font-medium">Operador: {t.agency?.name || 'N/A'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-bold">
                            <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            {t.departureCity}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            {new Date(t.departureDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        ${t.price.toLocaleString('es-MX')} <span className="text-[10px] font-semibold text-slate-400">MXN</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 max-w-[120px]">
                          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                            <span>{t.blockedSeats?.length || 0} / {t.totalSeats}</span>
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                          </div>
                          <button
                            onClick={() => setSelectedTripForSeats(t)}
                            className="text-[11px] font-bold text-emerald-600 hover:underline inline-block mt-1"
                          >
                            ⚙️ Ver y marcar asientos
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          t.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {t.is_approved ? (
                            <>
                              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Aprobado
                            </>
                          ) : (
                            <>
                              <Clock className="h-3.5 w-3.5 text-amber-500" /> Pendiente
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!t.is_approved && (
                            <button
                              onClick={() => handleApproveTrip(t.id)}
                              disabled={isLoading}
                              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition disabled:opacity-50"
                              title="Aprobar viaje"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditForm(t)}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
                            title="Editar Viaje"
                          >
                            <Edit2 className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro que deseas eliminar este viaje? Esta acción no se puede deshacer.')) {
                                onDeleteTrip(t.id);
                              }
                            }}
                            className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                            title="Eliminar Viaje"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SEATS DETAILED POPUP FOR DIRECT MANUALLY BLOCKING SEATS */}
      {selectedTripForSeats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">Bloqueo Manual de Asientos</h4>
                <p className="text-xs text-slate-500 mt-0.5">Haz clic sobre un asiento para marcarlo como vendido u ocupado.</p>
              </div>
              <button
                onClick={() => setSelectedTripForSeats(null)}
                className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-2xl border border-slate-150 bg-slate-50 p-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Autobús de {selectedTripForSeats.totalSeats} lugares</span>
                <span className="text-xs font-bold text-slate-800">{selectedTripForSeats.blockedSeats?.length || 0} ocupados</span>
              </div>

              <div className="grid grid-cols-4 gap-2.5 justify-items-center">
                {Array.from({ length: selectedTripForSeats.totalSeats }).map((_, idx) => {
                  const seatNo = idx + 1;
                  const isBlocked = (selectedTripForSeats.blockedSeats || []).includes(seatNo);
                  return (
                    <button
                      key={seatNo}
                      onClick={() => handleToggleSeatBlock(selectedTripForSeats.id, seatNo)}
                      className={`relative flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold border transition ${
                        isBlocked
                          ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100'
                          : 'bg-white text-slate-800 border-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {seatNo}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-around text-[10px] font-bold uppercase tracking-wider text-slate-400 border-t border-slate-200 pt-3">
                <span className="flex items-center gap-1">
                  <span className="h-3.5 w-3.5 rounded-md border border-slate-300 bg-white" /> Disponible
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-3.5 w-3.5 rounded-md bg-rose-500" /> Vendido / Bloqueado
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTripForSeats(null)}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-850"
            >
              Cerrar Administrador de Asientos
            </button>
          </div>
        </div>
      )}

      {/* TRIP ADD/EDIT DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-150 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {editingTrip ? 'Editar Detalles del Viaje' : 'Subir Nuevo Viaje'}
                </h3>
                <p className="text-xs text-slate-500">Registra todos los detalles para que los viajeros se sientan seguros de comprar.</p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Fields */}
              <div className="grid gap-4.5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Título del Viaje</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Grutas de Tolantongo: Escapada de Aguas Termales"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Descripción</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Escribe los atractivos principales..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Ciudad de Salida</label>
                  <select
                    value={formDepartureCity}
                    onChange={(e) => setFormDepartureCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="CDMX">CDMX</option>
                    <option value="Guadalajara">Guadalajara</option>
                    <option value="Monterrey">Monterrey</option>
                    <option value="Querétaro">Querétaro</option>
                    <option value="Puebla">Puebla</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Destino Final</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Hidalgo, Jalisco"
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fecha de Salida</label>
                  <input
                    type="date"
                    required
                    value={formDepartureDate}
                    onChange={(e) => setFormDepartureDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Fecha de Retorno</label>
                  <input
                    type="date"
                    required
                    value={formReturnDate}
                    onChange={(e) => setFormReturnDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Precio Unitario ($ MXN)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Duración</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1 Día, 3 Días y 2 Noches"
                    value={formDurationText}
                    onChange={(e) => setFormDurationText(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Categoría</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as Trip['category'])}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="Playa">Playa</option>
                    <option value="Naturaleza">Naturaleza</option>
                    <option value="Pueblo Mágico">Pueblo Mágico</option>
                    <option value="Aventura">Aventura</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Fin de Semana">Fin de Semana</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">URLs de Imágenes (Separadas por Comas)</label>
                  <input
                    type="text"
                    placeholder="https://img1.jpg, https://img2.jpg"
                    value={formImages}
                    onChange={(e) => setFormImages(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Deja vacío para usar una imagen representativa automática.</span>
                </div>
              </div>

              {/* Departure Point Info */}
              <div className="border-t border-slate-150 pt-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <MapPin className="h-4.5 w-4.5 text-emerald-600 shrink-0" /> Punto de Salida
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dirección Completa</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Monumento a la Revolución, CDMX"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Instrucciones de Abordaje</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Cita a las 05:30 AM en las banquetas principales."
                      value={formInstructions}
                      onChange={(e) => setFormInstructions(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Enlace de Embed Google Maps (Opcional)</label>
                    <input
                      type="text"
                      placeholder="https://www.google.com/maps/embed?..."
                      value={formEmbedUrl}
                      onChange={(e) => setFormEmbedUrl(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Inclusions / Exclusions */}
              <div className="border-t border-slate-150 pt-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" /> Inclusiones y Exclusiones
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">¿Qué está incluido?</label>
                    <textarea
                      rows={3}
                      placeholder="Transporte ejecutivo redondo&#10;Entradas al parque"
                      value={formWhatsIncluded}
                      onChange={(e) => setFormWhatsIncluded(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">¿Qué no está incluido?</label>
                    <textarea
                      rows={3}
                      placeholder="Alimentos y bebidas&#10;Tirolesa"
                      value={formWhatsNotIncluded}
                      onChange={(e) => setFormWhatsNotIncluded(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Itinerary Builder */}
              <div className="border-t border-slate-150 pt-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <Clock className="h-4.5 w-4.5 text-emerald-600 shrink-0" /> Itinerario
                </h4>
                
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-xl border border-slate-150 p-3 bg-slate-50">
                  {formItinerary.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 text-xs bg-white p-2.5 rounded-lg border border-slate-200">
                      <div>
                        <strong className="text-emerald-700">{item.timeOrDay}</strong>: <span className="text-slate-800 font-extrabold">{item.title}</span>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItineraryItem(idx)}
                        className="text-rose-500 font-bold hover:underline shrink-0"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                  {formItinerary.length === 0 && (
                    <div className="text-center text-slate-400 py-3 text-xs">No hay paradas en el itinerario aún.</div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Agregar Nueva Parada</span>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Día / Hora</label>
                      <input
                        type="text"
                        placeholder="Ej. 08:00 AM"
                        value={itTime}
                        onChange={(e) => setItTime(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Título</label>
                      <input
                        type="text"
                        placeholder="Ej. Cita en punto de encuentro"
                        value={itTitle}
                        onChange={(e) => setItTitle(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">Descripción</label>
                      <input
                        type="text"
                        placeholder="Ej. Estaremos abordando puntualmente el transporte."
                        value={itDesc}
                        onChange={(e) => setItDesc(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddItineraryItem}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-slate-800"
                  >
                    Agregar parada
                  </button>
                </div>
              </div>

              {/* Agency Info */}
              <div className="border-t border-slate-150 pt-5 space-y-4">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" /> Agencia Operadora
                </h4>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre de Agencia</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Rutas Verdes México"
                      value={formAgencyName}
                      onChange={(e) => setFormAgencyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">URL de Logo</label>
                    <input
                      type="text"
                      required
                      placeholder="https://logo.jpg"
                      value={formAgencyLogo}
                      onChange={(e) => setFormAgencyLogo(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">WhatsApp de Ventas</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 525512345678"
                      value={formAgencyPhone}
                      onChange={(e) => setFormAgencyPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3.5 border-t border-slate-150 pt-5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700"
                >
                  <Save className="h-4.5 w-4.5" />
                  {editingTrip ? 'Guardar Cambios' : 'Publicar Viaje'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}