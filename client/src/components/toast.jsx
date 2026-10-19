import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Icon from './Icons.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((type, message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const api = useMemo(() => ({ success: (m) => push('success', m), error: (m) => push('error', m) }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-24 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 md:bottom-6 md:right-6" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="flex animate-toast-in items-start gap-3 rounded-xl border border-line bg-surface px-4 py-3 text-sm shadow-card">
            <span className={`mt-0.5 ${t.type === 'success' ? 'text-good' : 'text-bad'}`}>
              <Icon name={t.type === 'success' ? 'check' : 'alert'} className="size-4" />
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
