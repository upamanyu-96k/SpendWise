import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { useChartTheme } from '../theme.jsx';
import Icon from '../components/Icons.jsx';
import { axisMoney, BudgetBar, CategoryAvatar, ChartTooltip, Empty, ErrorMessage, PageHeader, PageSkeleton } from '../components/ui.jsx';
import { CATEGORY_COLORS } from '../constants.js';
import { currentMonth, formatDate, greeting, inr, monthLabel, monthName } from '../utils.js';

function Stat({ icon, label, value, tone = 'text-main', accent = 'text-brand', delay = 0 }) {
  return (
    <div className="card animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl bg-raised ${accent}`}><Icon name={icon} className="size-[18px]" /></span>
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${tone}`}>{value}</p>
    </div>
  );
}

const INSIGHT = {
  warning: { icon: 'alert', box: 'border-warn/30 bg-warn/10', tint: 'text-warn' },
  positive: { icon: 'check', box: 'border-good/30 bg-good/10', tint: 'text-good' },
  info: { icon: 'sparkle', box: 'border-line bg-surface/80', tint: 'text-brand' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const chart = useChartTheme();
  const [month, setMonth] = useState(currentMonth());
  const { data, loading, error } = useAsync(() => api.summary(month), [month]);
  const trend = useAsync(() => api.monthly(6), []);
  const atRisk = data ? data.budgets.filter((b) => b.status !== 'ok').length : 0;

  return (
    <div className="space-y-6">
      <PageHeader title={`${greeting()}, ${user?.name?.split(' ')[0] || 'there'}`} subtitle="Here is how your money is doing.">
        <div>
          <label htmlFor="month" className="label">Month</label>
          <input id="month" type="month" className="input w-44" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </div>
      </PageHeader>

      <ErrorMessage message={error} />
      {loading && !data ? <PageSkeleton /> : data && (
        <>
          <section className="relative animate-fade-up overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-brand/15 via-surface to-violet-500/15 p-6 shadow-card md:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-brand/15 blur-3xl" />
            <p className="relative text-sm text-muted">Balance · {monthName(data.month)}</p>
            <p className={`relative mt-1 text-4xl font-semibold tracking-tight md:text-5xl ${data.balance < 0 ? 'text-bad' : ''}`}>{inr(data.balance)}</p>
            <div className="relative mt-6 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-good/30 bg-good/10 px-3.5 py-1.5 text-good"><Icon name="arrowDown" className="size-4" />Income {inr(data.income)}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-bad/30 bg-bad/10 px-3.5 py-1.5 text-bad"><Icon name="arrowUp" className="size-4" />Spent {inr(data.expenses)}</span>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat delay={40} icon="arrowDown" label="Income" value={inr(data.income)} accent="text-good" />
            <Stat delay={80} icon="arrowUp" label="Expenses" value={inr(data.expenses)} accent="text-bad" />
            <Stat delay={120} icon="percent" label="Saved from income" value={`${data.savingsRate}%`} tone={data.savingsRate < 0 ? 'text-bad' : ''} />
            <Stat delay={160} icon="target" label="Budgets at risk" value={atRisk} tone={atRisk ? 'text-warn' : ''} accent={atRisk ? 'text-warn' : 'text-brand'} />
          </div>

          <div className="grid gap-6 lg:grid-cols-5">
            <section className="card lg:col-span-3">
              <h2 className="font-semibold">Cash flow</h2>
              <p className="mb-4 text-sm text-muted">Income and spending over the last 6 months</p>
              <div className="h-64">
                {trend.data && (
                  <ResponsiveContainer>
                    <AreaChart data={trend.data.series.map((s) => ({ ...s, label: monthLabel(s.month) }))} margin={{ left: 0, right: 8, top: 8 }}>
                      <defs>
                        <linearGradient id="gIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={chart.income} stopOpacity={0.35} /><stop offset="100%" stopColor={chart.income} stopOpacity={0} /></linearGradient>
                        <linearGradient id="gExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={chart.expense} stopOpacity={0.3} /><stop offset="100%" stopColor={chart.expense} stopOpacity={0} /></linearGradient>
                      </defs>
                      <CartesianGrid stroke={chart.grid} strokeDasharray="3 6" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={axisMoney} tick={{ fill: chart.tick, fontSize: 12 }} axisLine={false} tickLine={false} width={54} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: chart.grid }} />
                      <Area type="monotone" dataKey="income" name="Income" stroke={chart.income} strokeWidth={2.5} fill="url(#gIncome)" />
                      <Area type="monotone" dataKey="expenses" name="Expenses" stroke={chart.expense} strokeWidth={2.5} fill="url(#gExpense)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </section>

            <section className="card lg:col-span-2">
              <h2 className="mb-2 font-semibold">Spending by category</h2>
              {data.byCategory.length === 0 ? (
                <Empty icon="chart" title="No expenses this month" hint="Add an expense to see where your money goes.">
                  <Link to="/transactions" className="btn-primary"><Icon name="plus" className="size-4" />Add a transaction</Link>
                </Empty>
              ) : (
                <>
                  <div className="relative h-48" aria-hidden="true">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={data.byCategory} dataKey="amount" nameKey="category" innerRadius={58} outerRadius={84} paddingAngle={3} stroke="none">
                          {data.byCategory.map((c) => <Cell key={c.category} fill={CATEGORY_COLORS[c.category]} />)}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                      <div><p className="text-xs text-muted">Spent</p><p className="text-lg font-semibold">{inr(data.expenses)}</p></div>
                    </div>
                  </div>
                  <ul className="mt-3 space-y-2 text-sm">
                    {data.byCategory.slice(0, 5).map((c) => (
                      <li key={c.category} className="flex items-center justify-between">
                        <span className="flex items-center gap-2.5"><span className="size-2.5 rounded-full" style={{ background: CATEGORY_COLORS[c.category] }} />{c.category}</span>
                        <span className="font-medium">{inr(c.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="card">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Budgets</h2>
                <Link to="/budgets" className="text-sm text-brand hover:underline">Manage</Link>
              </div>
              {data.budgets.length === 0 ? (
                <Empty icon="target" title="No budgets for this month" hint="Set a limit for a category to get a warning before you overspend." />
              ) : (
                <div className="space-y-5">{data.budgets.map((b) => <BudgetBar key={b.id} budget={b} />)}</div>
              )}
            </section>

            <div className="space-y-6">
              <section>
                <h2 className="mb-3 font-semibold">Insights</h2>
                {data.insights.length === 0 ? (
                  <p className="card text-sm text-muted">Insights appear once you have a few transactions across two months.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {data.insights.map((i, idx) => {
                      const s = INSIGHT[i.type];
                      return (
                        <li key={idx} className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${s.box}`}>
                          <span className={`mt-0.5 ${s.tint}`}><Icon name={s.icon} className="size-4" /></span>{i.message}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <section className="card">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold">Recent activity</h2>
                  <Link to="/transactions" className="text-sm text-brand hover:underline">View all</Link>
                </div>
                {data.recent.length === 0 ? <p className="text-sm text-muted">Nothing recorded yet.</p> : (
                  <ul className="divide-y divide-line">
                    {data.recent.map((t) => (
                      <li key={t._id} className="flex items-center gap-3 py-3 text-sm">
                        <CategoryAvatar category={t.category} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{t.description || t.category}</span>
                          <span className="text-xs text-muted">{t.category} · {formatDate(t.date)}</span>
                        </span>
                        <span className={`font-semibold ${t.type === 'income' ? 'text-good' : ''}`}>{t.type === 'income' ? '+' : '−'}{inr(t.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
