# Viajoteca 🌍

Plataforma marketplace de viajes organizados con agencias verificadas.

## Configuración Rápida

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Supabase
1. Ve a [supabase.com](https://supabase.com) y crea un proyecto
2. En **Project Settings → API**, copia tu Project URL y anon key
3. Crea un archivo `.env` en la raíz:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

### 3. Ejecutar migraciones SQL
1. En Supabase, ve a **SQL Editor**
2. Copia y pega el contenido de `supabase/migrations/001_initial_schema.sql`
3. Ejecuta el script

### 4. Configurar Auth en Supabase
1. Ve a **Authentication → Providers**
2. Habilita **Email** provider
3. Desactiva **Confirm email** (para desarrollo)

### 5. Desarrollo local
```bash
npm run dev
```

### 6. Deploy en Vercel
```bash
git init && git add . && git commit -m "Initial"
# Sube a GitHub, luego importa en Vercel
# Agrega las variables de entorno en Vercel → Settings → Environment Variables
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Catálogo público |
| `/trip/:id` | Detalle de viaje |
| `/login` | Iniciar sesión |
| `/register` | Registrarse (viajero o agencia) |
| `/agency` | Panel de agencia (protegido) |
| `/agency/trips/new` | Crear viaje (agencia) |
| `/admin` | Panel administrador (contraseña) |

## Stack
- React + Vite + TypeScript + Tailwind CSS
- Supabase (Auth, PostgreSQL, RLS)
- React Router DOM
- react-hot-toast
- lucide-react
