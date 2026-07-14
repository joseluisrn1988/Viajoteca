import { useEffect, useRef, useState } from 'react';
import { ImagePlus, LoaderCircle, UploadCloud, X } from 'lucide-react';
import toast from 'react-hot-toast';
import type { TripImageInput } from '../../types';

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface ImageUploadProps {
  value: TripImageInput[];
  onChange: (images: TripImageInput[]) => void;
  disabled?: boolean;
}

function ImagePreview({ image, index, onRemove, disabled }: { image: TripImageInput; index: number; onRemove: () => void; disabled: boolean }) {
  const [src, setSrc] = useState(typeof image === 'string' ? image : '');

  useEffect(() => {
    if (typeof image === 'string') {
      setSrc(image);
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setSrc(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  return (
    <div className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
      <img
        src={src}
        alt={`Imagen ${index + 1}`}
        className="h-full w-full object-cover"
      />
      <span className="absolute bottom-2 left-2 rounded-md bg-slate-900/75 px-2 py-0.5 text-[10px] font-semibold text-white">
        {typeof image === 'string' ? 'Guardada' : 'Lista para subir'}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={onRemove}
        aria-label={`Eliminar imagen ${index + 1}`}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-rose-500 shadow-md transition hover:bg-rose-50 disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function ImageUpload({ value, onChange, disabled = false }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const availableSlots = MAX_IMAGES - value.length;

    if (availableSlots <= 0) {
      toast.error(`Puedes subir un máximo de ${MAX_IMAGES} imágenes.`);
      event.target.value = '';
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida.`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} supera el límite de 5 MB.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > availableSlots) {
      toast.error(`Solo puedes agregar ${availableSlots} imagen${availableSlots === 1 ? '' : 'es'} más.`);
    }

    onChange([...value, ...validFiles.slice(0, availableSlots)]);
    event.target.value = '';
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Fotos del viaje</label>
          <p className="mt-1 text-[11px] text-slate-500">Sube hasta 5 imágenes JPG, PNG, WEBP o GIF. Máximo 5 MB por imagen.</p>
        </div>
        <span className="shrink-0 text-xs font-bold text-slate-400">{value.length} / {MAX_IMAGES}</span>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {value.map((image, index) => (
            <ImagePreview
              key={typeof image === 'string' ? image : `${image.name}-${image.lastModified}-${index}`}
              image={image}
              index={index}
              disabled={disabled}
              onRemove={() => onChange(value.filter((_, currentIndex) => currentIndex !== index))}
            />
          ))}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={handleFiles}
        disabled={disabled || value.length >= MAX_IMAGES}
      />
      <button
        type="button"
        disabled={disabled || value.length >= MAX_IMAGES}
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-4 py-4 text-sm font-bold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {disabled ? <LoaderCircle className="h-4 w-4 animate-spin" /> : value.length > 0 ? <ImagePlus className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
        {disabled ? 'Subiendo imágenes...' : value.length >= MAX_IMAGES ? 'Límite de imágenes alcanzado' : 'Seleccionar imágenes'}
      </button>
    </div>
  );
}