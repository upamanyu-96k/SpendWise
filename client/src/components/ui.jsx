import { useEffect, useState } from 'react';
import Icon from './Icons.jsx';
import { CATEGORY_COLORS, CATEGORY_EMOJI } from '../constants.js';
import { compactInr, inr, passwordScore } from '../utils.js';

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[92vh] w-full max-w-md animate-fade-up overflow-y-auto rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap items-end gap-3">{children}</div>}
    </div>
  );
}

export function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="flex items-start gap-2 rounded-xl border border-bad/30 bg-bad/10 px-3.5 py-2.5 text-sm text-bad">
      <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export function SuccessMessage({ message }) {
  if (!message) return null;
  return (
    <p role="status" className="flex items-start gap-2 rounded-xl border border-good/30 bg-good/10 px-3.5 py-2.5 text-sm text-good">
      <Icon name="check" className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

export function Skeleton({ className = 'h-24' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading">
      <Skeleton className="h-40" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>
      <Skeleton className="h-64" />
    </div>
  );
}

export function Empty({ icon = 'sparkle', title, hint, children }) {
  return (
    <div className="px-4 py-12 text-center">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-brand/10 text-brand"><Icon name={icon} className="size-6" /></div>
      <p className="font-medium">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{hint}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}

export function CategoryAvatar({ category, className = 'size-10 text-lg' }) {
  const color = CATEGORY_COLORS[category] || '#94A3B8';
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl ${className}`} style={{ background: `${color}22`, boxShadow: `inset 0 0 0 1px ${color}44` }} aria-hidden="true">
      {CATEGORY_EMOJI[category] || '✨'}
    </span>
  );
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="inline-flex rounded-xl border border-line bg-raised/60 p-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${value === o.value ? 'bg-surface text-main shadow-card' : 'text-muted hover:text-main'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const STATUS = {
  ok: { bar: 'from-brand to-teal-300', text: 'text-brand', label: 'On track' },
  warning: { bar: 'from-warn to-amber-300', text: 'text-warn', label: 'Close to limit' },
  exceeded: { bar: 'from-bad to-rose-400', text: 'text-bad', label: 'Over budget' },
};

export function BudgetBar({ budget }) {
  const s = STATUS[budget.status];
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5 font-medium">
          <CategoryAvatar category={budget.category} className="size-8 text-base" />
          {budget.category}
        </span>
        <span className={`text-sm font-semibold ${s.text}`}>{budget.utilization}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-raised" role="progressbar" aria-valuenow={Math.min(budget.utilization, 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${budget.category} budget used`}>
        <div className={`h-full rounded-full bg-gradient-to-r ${s.bar} transition-all duration-700`} style={{ width: `${Math.min(budget.utilization, 100)}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-muted">
        {inr(budget.spent)} of {inr(budget.monthlyLimit)} ·{' '}
        <span className={s.text}>{budget.remaining >= 0 ? `${inr(budget.remaining)} left` : `${inr(-budget.remaining)} over`}</span>
      </p>
    </div>
  );
}

// Used as <Tooltip content={<ChartTooltip />} /> so charts match the theme
export function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-sm shadow-card">
      {label && <p className="mb-1 font-medium">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey || p.name} className="flex items-center gap-2 text-muted">
          <span className="size-2.5 rounded-full" style={{ background: p.color || p.payload?.fill }} />
          {p.name}: <span className="font-medium text-main">{inr(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export const axisMoney = (v) => compactInr(v);

export function PasswordField({ id, label, value, onChange, autoComplete, placeholder, minLength = 1, hint }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} className="input pr-11" required minLength={minLength} value={value} onChange={onChange} autoComplete={autoComplete} placeholder={placeholder} />
        <button type="button" className="icon-btn absolute right-1 top-1/2 -translate-y-1/2" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>
          <Icon name={show ? 'eyeOff' : 'eye'} className="size-4" />
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function StrengthMeter({ password }) {
  if (!password) return null;
  const score = passwordScore(password);
  const labels = ['Too short', 'Weak', 'Okay', 'Good', 'Strong'];
  const colors = ['bg-bad', 'bg-bad', 'bg-warn', 'bg-good', 'bg-good'];
  return (
    <div aria-live="polite">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4].map((i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= score ? colors[score] : 'bg-raised'}`} />)}
      </div>
      <p className="mt-1 text-xs text-muted">Password strength: {labels[score]}</p>
    </div>
  );
}
