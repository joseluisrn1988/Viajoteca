import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function SocialLoginButtons() {
  const { signInWithOAuth } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);

  const handle = async (provider: 'google' | 'facebook') => {
    setBusy(provider);
    await signInWithOAuth(provider);
    setBusy(null);
  };

  return (
    <div className="space-y-3">
      <div className="relative flex items-center py-2">
        <div className="flex-1 border-t border-slate-200" />
        <span className="mx-4 shrink-0 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">o continúa con</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      <button
        type="button"
        disabled={busy !== null}
        onClick={() => handle('google')}
        className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50"
      >
        {busy === 'google' ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
        ) : (
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        )}
        Continuar con Google
      </button>

      <button
        type="button"
        disabled={busy !== null}
        onClick={() => handle('facebook')}
        className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#1877F2] py-3 text-sm font-bold text-white shadow-xs transition hover:bg-[#166FE5] disabled:opacity-50"
      >
        {busy === 'facebook' ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        ) : (
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        )}
        Continuar con Facebook
      </button>
    </div>
  );
}
