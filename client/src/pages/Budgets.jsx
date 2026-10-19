import { useState } from 'react';
import { api } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import Icon from '../components/Icons.jsx';
import { BudgetBar, Empty, ErrorMessage, Modal, PageHeader, Skeleton } from '../components/ui.jsx';
import { useToast } from '../components/toast.jsx';
import { EXPENSE_CATEGORIES } from '../constants.js';
import { currentMonth, inr, monthName } from '../utils.js';

export default function Budgets() {
  const toast = useToast();
  const [month, setMonth] = useState(currentMonth());
  const [category, setCategory] = useState('Food');
  const [limit, setLimit] = useState('');
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const { data, loading, error: loadError, reload } = useAsync(() => api.budgets(month), [month]);

  const existing = data?.budgets.find((b) => b.category === category);
  const totalLimit = data?.budgets.reduce((s, b) => s + b.monthlyLimit, 0) || 0;
  const totalSpent = data?.budgets.reduce((s, b) => s + b.spent, 0) || 0;

  async function save(e) {
    e.preventDefault();
    setError('');
    try {
      await api.saveBudget({ category, month, monthlyLimit: Number(limit) });
      toast.success(existing ? `${category} budget updated.` : `${category} budget set.`);
      setLimit('');
      reload();
    } catch (err) { setError(err.message); }
  }

  async function confirmDelete() {
    try {
      await api.deleteBudget(toDelete.id);
      toast.success('Budget removed.');
      reload();
    } catch (err) { toast.error(err.message); }
    setToDelete(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Budgets" subtitle={`Spending limits for ${monthName(month)}.`}>
        <div>
          <label className="label" htmlFor="bmonth">Month</label>
          <input id="bmonth" type="month" className="input w-44" value={month} onChange={(e) => e.target.value && setMonth(e.target.value)} />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={save} className="card space-y-4 self-start lg:sticky lg:top-8">
          <h2 className="font-semibold">{existing ? 'Update a budget' : 'Set a budget'}</h2>
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
          <ErrorMessage message={error || loadError} />
          <button className="btn-primary w-full">{existing ? 'Update budget' : 'Set budget'}</button>
          <p className="text-xs text-muted">You'll see an amber warning at 80% and red once you pass 100%.</p>
        </form>

        <div className="space-y-4 lg:col-span-2">
          {data && data.budgets.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="card"><p className="text-sm text-muted">Total budgeted</p><p className="mt-1 text-2xl font-semibold">{inr(totalLimit)}</p></div>
              <div className="card"><p className="text-sm text-muted">Spent so far</p><p className="mt-1 text-2xl font-semibold">{inr(totalSpent)}</p></div>
            </div>
          )}
          {loading && !data ? (
            <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
          ) : data?.budgets.length === 0 ? (
            <div className="card"><Empty icon="target" title="No budgets for this month" hint="Choose a category and a limit to get started." /></div>
          ) : data && (
            <div className="grid gap-4 md:grid-cols-2">
              {data.budgets.map((b) => (
                <div key={b.id} className="card">
                  <BudgetBar budget={b} />
                  <button className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-bad" onClick={() => setToDelete(b)}>
                    <Icon name="trash" className="size-3.5" />Remove budget
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toDelete && (
        <Modal title="Remove budget?" onClose={() => setToDelete(null)}>
          <p className="text-sm text-muted">The {toDelete.category} budget for {monthName(month)} will be removed. Your transactions are not affected.</p>
          <div className="mt-6 flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
            <button className="btn-danger" onClick={confirmDelete}>Remove</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
