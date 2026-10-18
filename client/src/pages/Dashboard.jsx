import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { api } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { BudgetBar, Empty, ErrorMessage, Spinner } from '../components/ui.jsx';
import { CATEGORY_COLORS } from '../constants.js';
import { currentMonth, formatDate, inr } from '../utils.js';

function Stat({ label, value, tone }) {
  return (
    <div className="card">
      <p className="text-sm text-ink/70">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${tone || ''}`}>{value}</p>
    </div>
  );
}

const insightStyle = {
  warning: 'bg-warn-soft border-warn/30',
  positive: 'bg-brand-soft border-brand/30',
  info: 'bg-white border-line',
};

export default function Dashboard() {
  const [month, setMonth] = useState(currentMonth());
  const { data, loading, error } = useAsync(() => api.summary(month), [month]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Dashboard</h1>
        <div>
          <label htmlFor="month" className="label">Month</label>
          <input id="month" type="month" className="input" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </div>
      </div>

      <ErrorMessage message={error} />
      {loading && !data ? <Spinner /> : data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Income" value={inr(data.income)} />
            <Stat label="Expenses" value={inr(data.expenses)} />
            <Stat label="Balance" value={inr(data.balance)} tone={data.balance < 0 ? 'text-danger' : 'text-brand-dark'} />
            <Stat label="Saved from income" value={`${data.savingsRate}%`} tone={data.savingsRate < 0 ? 'text-danger' : ''} />
          </div>

          <div className="grid lg:grid-cols-5 gap-6">
            <section className="card lg:col-span-2">
              <h2 className="font-semibold mb-3">Spending by category</h2>
              {data.byCategory.length === 0 ? (
                <Empty title="No expenses this month" hint="Add an expense to see where your money goes.">
                  <Link to="/transactions" className="btn-primary">Add a transaction</Link>
                </Empty>
              ) : (
                <>
                  <div className="h-52" aria-hidden="true">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={data.byCategory} dataKey="amount" nameKey="category" innerRadius={50} outerRadius={80} paddingAngle={2}>
                          {data.byCategory.map((c) => <Cell key={c.category} fill={CATEGORY_COLORS[c.category]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => inr(v)} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm">
                    {data.byCategory.map((c) => (
                      <li key={c.category} className="flex items-center justify-between">
                        <span className="flex items-center gap-2"><span className="size-3 rounded-sm" style={{ background: CATEGORY_COLORS[c.category] }} />{c.category}</span>
                        <span>{inr(c.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            <section className="card lg:col-span-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Budgets</h2>
                <Link to="/budgets" className="text-sm text-brand-dark underline">Manage budgets</Link>
              </div>
              {data.budgets.length === 0 ? (
                <Empty title="No budgets for this month" hint="Set a limit for a category to get warnings before you overspend." />
              ) : (
                <div className="space-y-4">{data.budgets.map((b) => <BudgetBar key={b.id} budget={b} />)}</div>
              )}
            </section>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <section>
              <h2 className="font-semibold mb-3">Insights</h2>
              {data.insights.length === 0 ? (
                <p className="text-sm text-ink/70">Insights appear once you have a few transactions.</p>
              ) : (
                <ul className="space-y-2">
                  {data.insights.map((i, idx) => (
                    <li key={idx} className={`rounded-md border px-4 py-3 text-sm ${insightStyle[i.type]}`}>{i.message}</li>
                  ))}
                </ul>
              )}
            </section>
            <section className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">Recent transactions</h2>
                <Link to="/transactions" className="text-sm text-brand-dark underline">View all</Link>
              </div>
              {data.recent.length === 0 ? <p className="text-sm text-ink/70">Nothing recorded yet.</p> : (
                <ul className="divide-y divide-line">
                  {data.recent.map((t) => (
                    <li key={t._id} className="py-2 flex items-center justify-between text-sm">
                      <span><span className="font-medium">{t.description || t.category}</span><br /><span className="text-ink/60">{t.category} · {formatDate(t.date)}</span></span>
                      <span className={t.type === 'income' ? 'text-brand-dark font-medium' : ''}>{t.type === 'income' ? '+' : '−'}{inr(t.amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
