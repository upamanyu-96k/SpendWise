import { useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { api } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { Empty, ErrorMessage, Spinner } from '../components/ui.jsx';
import { CATEGORY_COLORS } from '../constants.js';
import { inr, monthLabel } from '../utils.js';

export default function Analytics() {
  const [months, setMonths] = useState(6);
  const { data, loading, error } = useAsync(() => api.monthly(months), [months]);

  const { series, categoryRows, categories } = useMemo(() => {
    if (!data) return { series: [], categoryRows: [], categories: [] };
    const series = data.series.map((s) => ({ ...s, label: monthLabel(s.month) }));
    const totals = {};
    data.categories.forEach((c) => { totals[c.category] = (totals[c.category] || 0) + c.amount; });
    const categories = Object.keys(totals).sort((a, b) => totals[b] - totals[a]);
    const categoryRows = series.map((s) => {
      const row = { label: s.label };
      data.categories.filter((c) => c.month === s.month).forEach((c) => { row[c.category] = c.amount; });
      return row;
    });
    return { series, categoryRows, categories };
  }, [data]);

  const hasData = data && data.series.some((s) => s.income || s.expenses);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Analytics</h1>
        <div>
          <label className="label" htmlFor="months">Period</label>
          <select id="months" className="input" value={months} onChange={(e) => setMonths(Number(e.target.value))}>
            <option value={3}>Last 3 months</option><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option>
          </select>
        </div>
      </div>
      <ErrorMessage message={error} />
      {loading && !data ? <Spinner /> : data && !hasData ? (
        <Empty title="Nothing to analyse yet" hint="Add some income and expenses and your trends will show up here." />
      ) : data && (
        <>
          <section className="card">
            <h2 className="font-semibold mb-3">Income and expenses</h2>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={series} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid stroke="#DCE1DB" strokeDasharray="3 3" />
                  <XAxis dataKey="label" /><YAxis tickFormatter={(v) => `₹${v / 1000}k`} width={56} />
                  <Tooltip formatter={(v) => inr(v)} /><Legend />
                  <Line type="monotone" dataKey="income" name="Income" stroke="#0E7C66" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#B3261E" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="card">
            <h2 className="font-semibold mb-3">Expenses by category, month by month</h2>
            <div className="h-80">
              <ResponsiveContainer>
                <BarChart data={categoryRows} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid stroke="#DCE1DB" strokeDasharray="3 3" />
                  <XAxis dataKey="label" /><YAxis tickFormatter={(v) => `₹${v / 1000}k`} width={56} />
                  <Tooltip formatter={(v) => inr(v)} /><Legend />
                  {categories.map((c) => <Bar key={c} dataKey={c} stackId="a" fill={CATEGORY_COLORS[c]} />)}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
