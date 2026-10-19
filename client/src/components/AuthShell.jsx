import { Logo } from './Layout.jsx';
import Icon from './Icons.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const POINTS = [
  ['chart', 'See where every rupee goes', 'Clear charts for spending by category and month.'],
  ['target', 'Stay inside your budgets', 'Get a warning at 80% instead of a surprise at 100%.'],
  ['sparkle', 'Understand your habits', 'Plain-language insights from your own numbers.'],
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden border-r border-line p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 top-20 size-96 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 size-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex items-center gap-3"><Logo size="size-10" /><span className="text-xl font-semibold tracking-tight">SpendWise</span></div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">Money, made <span className="bg-gradient-to-r from-brand to-violet-400 bg-clip-text text-transparent">understandable.</span></h2>
          <ul className="mt-10 space-y-6">
            {POINTS.map(([icon, head, text]) => (
              <li key={head} className="flex gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface/70 text-brand"><Icon name={icon} /></span>
                <span><span className="block font-medium">{head}</span><span className="text-sm text-muted">{text}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-muted">Your data is private to your account.</p>
      </section>

      <section className="flex flex-col p-4 sm:p-8">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="flex items-center gap-2.5 lg:hidden"><Logo size="size-8" /><span className="font-semibold">SpendWise</span></div>
          <ThemeToggle compact />
        </div>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mb-7 mt-2 text-muted">{subtitle}</p>
          {children}
          {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
        </div>
      </section>
    </div>
  );
}
