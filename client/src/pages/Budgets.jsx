import { useState } from 'react';
import { api } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { BudgetBar, Empty, ErrorMessage, Spinner } from '../components/ui.jsx';
import { EXPENSE_CATEGORIES } from '../constants.js';
import { currentMonth } from '../utils.js';

export default function Budgets() {
  const [month, setMonth] = useState(currentMonth());
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');
  const { data, loading, error: loadError, reload } = useAsync(() => api.budgets(month), [month]);

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      await api.saveBudget({ category, month, monthlyLimit: Number(limit) });
      setLimit('');
      reload();
    } catch (err) { setError(err.message); }
  }

  async function remove(b) {
    if (!window.confirm(`Remove the ${b.category} budget?`)) return;
    try { await api.deleteBudget(b.id); reload(); } catch (err) { setError(err.message); }
  }

  const existing = data?.budgets.find((b) => b.category === category);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-3xl">Budgets</h1>
        <div>
          <label className="label" htmlFor="bmonth">Month</label>
          <input id="bmonth" type="month" className="input" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </div>
      </div>

      <form onSubmit={save} className="card grid sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="label" htmlFor="bcat">Category</label>
          <select id="bcat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
            {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="blimit">Monthly limit (₹)</label>
          <input id="blimit" type="number" min="1" step="1" required className="input" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder={existing ? String(existing.monthlyLimit) : '5000'} />
        </div>
        <button className="btn-primary">{existing ? 'Update budget' : 'Set budget'}</button>
        <div className="sm:col-span-3"><ErrorMessage message={error || loadError} /></div>
      </form>

      {loading && !data ? <Spinner /> : data?.budgets.length === 0 ? (
        <Empty title="No budgets for this month" hint="Choose a category and a limit above. You'll see a warning once you pass 80% of it." />
      ) : data && (
        <div className="grid md:grid-cols-2 gap-4">
          {data.budgets.map((b) => (
            <div key={b.id} className="card">
              <BudgetBar budget={b} />
              <button className="text-sm text-danger underline mt-3" onClick={() => remove(b)}>Remove budget</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
