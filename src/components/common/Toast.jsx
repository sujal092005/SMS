import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toasts } = useSchool();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold backdrop-blur-xl animate-in slide-in-from-top-3 duration-200 ${
              isSuccess
                ? 'bg-white/95 text-emerald-900 border-emerald-200'
                : isError
                ? 'bg-white/95 text-rose-900 border-rose-200'
                : 'bg-white/95 text-slate-900 border-slate-200'
            }`}
          >
            {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
            {isError && <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
            {!isSuccess && !isError && <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />}
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
