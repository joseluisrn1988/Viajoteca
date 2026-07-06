export default function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      {text && <p className="text-sm font-semibold text-slate-500">{text}</p>}
    </div>
  );
}
