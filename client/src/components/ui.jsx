import { useEffect } from 'react';
import { inr } from '../utils.js';

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-ink/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">{title}</h2>
          <button className="text-ink/60 hover:text-ink text-2xl leading-none" onClick={onClose} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return <p role="alert" className="rounded-md bg-danger-soft text-danger text-sm px-3 py-2">{message}</p>;
}

export function Spinner({ label = 'Loading' }) {
  return <p className="text-sm text-ink/60 py-8 text-center" role="status">{label}…</p>;
}

export function Empty({ title, hint, children }) {
  return (
    <div className="text-center py-10">
      <p className="font-medium">{title}</p>
      {hint && <p className="text-sm text-ink/60 mt-1">{hint}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

const STATUS = {
  ok: { bar: 'bg-brand', text: 'text-brand-dark', label: 'On track' },
  warning: { bar: 'bg-warn', text: 'text-warn', label: 'Close to limit' },
  exceeded: { bar: 'bg-danger', text: 'text-danger', label: 'Over budget' },
};

export function BudgetBar({ budget }) {
  const s = STATUS[budget.status];
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm mb-1">
        <span className="font-medium">{budget.category}</span>
        <span className="text-ink/70">{inr(budget.spent)} of {inr(budget.monthlyLimit)}</span>
      </div>
      <div className="h-2 rounded-full bg-line overflow-hidden" role="progressbar" aria-valuenow={Math.min(budget.utilization, 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${budget.category} budget used`}>
        <div className={`h-full ${s.bar}`} style={{ width: `${Math.min(budget.utilization, 100)}%` }} />
      </div>
      <p className={`text-xs mt-1 ${s.text}`}>
        {s.label} · {budget.utilization}% used ·{' '}
        {budget.remaining >= 0 ? `${inr(budget.remaining)} left` : `${inr(-budget.remaining)} over`}
      </p>
    </div>
  );
}
