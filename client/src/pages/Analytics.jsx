import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { useChartTheme } from '../theme.jsx';
import { axisMoney, ChartTooltip, Empty, ErrorMessage, PageHeader, PageSkeleton, Segmented } from '../components/ui.jsx';
import { CATEGORY_COLORS } from '../constants.js';
import { inr, monthLabel } from '../utils.js';

export default function Analytics() {
  const chart = useChartTheme();
  const [months, setMonths] = useState(6);
  const { data, loading, error } = useAsync(() => api.monthly(months), [months]);

  const view = useMemo(() => {
    if (!data) return null;
    const series = data.series.map((s) => ({ ...s, label: monthLabel(s.month) }));
    const totals = {};
    data.categories.forEach((c) => { totals[c.category] = (totals[c.category] || 0) + c.amount; });
    const categories = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
    const categoryRows = series.map((s) => {
      const row = { label: s.label };
      data.categories.filter((c) => c.month === s.month).forEach((c) => { row[c.category] = c.amount; });
      return row;
    });
    const active = series.filter((s) => s.income || s.expenses);
    const totalSpent = series.reduce((a, s) => a + s.expenses, 0);
    const totalIncome = series.reduce((a, s) => a + s.income, 0);
    const top = [...series].sort((a, b) => b.expenses - a.expenses)[0];
    return { series, categories, categoryRows, totalSpent, totalIncome, avg: active.length ? totalSpent / active.length : 0, top, hasData: active.length > 0 };
  }, [data]);

  const axis = { tick: { fill: chart.tick, fontSize: 12 }, axisLine: false, tickLine: false };
  const legend = (v) => <span className="text-sm text-muted">{v}</span>;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Spot trends in your income and spending.">
        <Segmented label="Period" value={months} onChange={setMonths} options={[{ value: 3, label: '3 months' }, { value: 6, label: '6 months' }, { value: 12, label: '12 months' }]} />
      </PageHeader>
      <ErrorMessage message={error} />
      {loading && !data ? <PageSkeleton /> : view && !view.hasData ? (
        <div className="card"><Empty icon="chart" title="Nothing to analyse yet" hint="Add some income and expenses and your trends will show up here." /></div>
      ) : view && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card"><p className="text-sm text-muted">Total income</p><p className="mt-1 text-2xl font-semibold text-good">{inr(view.totalIncome)}</p></div>
            <div className="card"><p className="text-sm text-muted">Average monthly spending</p><p className="mt-1 text-2xl font-semibold">{inr(Math.round(view.avg))}</p></div>
            <div className="card"><p className="text-sm text-muted">Highest-spend month</p><p className="mt-1 text-2xl font-semibold">{view.top?.expenses ? view.top.label : '—'}</p>{view.top?.expenses > 0 && <p className="text-xs text-muted">{inr(view.top.expenses)}</p>}</div>
          </div>

          <section className="card">
            <h2 className="mb-4 font-semibold">Income and expenses</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={view.series} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid stroke={chart.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="label" {...axis} /><YAxis tickFormatter={axisMoney} width={54} {...axis} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: chart.grid }} />
                  <Legend formatter={legend} iconType="circle" />
                  <Line type="monotone" dataKey="income" name="Income" stroke={chart.income} strokeWidth={2.5} dot={{ r: 3, fill: chart.income, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke={chart.expense} strokeWidth={2.5} dot={{ r: 3, fill: chart.expense, strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="card">
            <h2 className="mb-4 font-semibold">Expenses by category</h2>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={view.categoryRows} margin={{ left: 0, right: 8, top: 8 }}>
                  <CartesianGrid stroke={chart.grid} strokeDasharray="3 6" vertical={false} />
                  <XAxis dataKey="label" {...axis} /><YAxis tickFormatter={axisMoney} width={54} {...axis} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: chart.grid, fillOpacity: 0.35 }} />
                  <Legend formatter={legend} iconType="circle" />
                  {view.categories.map((c, i) => <Bar key={c} dataKey={c} stackId="a" fill={CATEGORY_COLORS[c]} radius={i === view.categories.length - 1 ? [6, 6, 0, 0] : 0} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
