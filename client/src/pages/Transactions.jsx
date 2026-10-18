import { useState } from 'react';
import { api } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { Empty, ErrorMessage, Modal, Spinner } from '../components/ui.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants.js';
import { formatDate, inr } from '../utils.js';

const ALL = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
const emptyFilters = { q: '', type: '', category: '', paymentMethod: '', from: '', to: '', minAmount: '', maxAmount: '' };

export default function Transactions() {
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | transaction
  const [actionError, setActionError] = useState('');
  const { data, loading, error, reload } = useAsync(() => api.transactions({ ...applied, page, limit: 15 }), [applied, page]);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const apply = (e) => { e.preventDefault(); setPage(1); setApplied(filters); };
  const reset = () => { setFilters(emptyFilters); setApplied(emptyFilters); setPage(1); };

  async function remove(t) {
    if (!window.confirm(`Delete "${t.description || t.category}" for ${inr(t.amount)}?`)) return;
    setActionError('');
    try { await api.deleteTransaction(t._id); reload(); } catch (e) { setActionError(e.message); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">Transactions</h1>
        <button className="btn-primary" onClick={() => setEditing('new')}>Add transaction</button>
      </div>

      <form onSubmit={apply} className="card grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
        <div className="col-span-2">
          <label className="label" htmlFor="q">Search notes</label>
          <input id="q" className="input" value={filters.q} onChange={set('q')} placeholder="Lunch" />
        </div>
        <div>
          <label className="label" htmlFor="ftype">Type</label>
          <select id="ftype" className="input" value={filters.type} onChange={set('type')}>
            <option value="">All</option><option value="expense">Expense</option><option value="income">Income</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="fcat">Category</label>
          <select id="fcat" className="input" value={filters.category} onChange={set('category')}>
            <option value="">All</option>{ALL.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="fpm">Paid with</label>
          <select id="fpm" className="input" value={filters.paymentMethod} onChange={set('paymentMethod')}>
            <option value="">All</option>{PAYMENT_METHODS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div><label className="label" htmlFor="from">From</label><input id="from" type="date" className="input" value={filters.from} onChange={set('from')} /></div>
        <div><label className="label" htmlFor="to">To</label><input id="to" type="date" className="input" value={filters.to} onChange={set('to')} /></div>
        <div><label className="label" htmlFor="min">Min ₹</label><input id="min" type="number" min="0" className="input" value={filters.minAmount} onChange={set('minAmount')} /></div>
        <div><label className="label" htmlFor="max">Max ₹</label><input id="max" type="number" min="0" className="input" value={filters.maxAmount} onChange={set('maxAmount')} /></div>
        <div className="col-span-2 md:col-span-4 flex gap-2 justify-end">
          <button type="button" className="btn-ghost" onClick={reset}>Clear filters</button>
          <button className="btn-primary">Apply filters</button>
        </div>
      </form>

      <ErrorMessage message={error || actionError} />

      <div className="card p-0 overflow-x-auto">
        {loading && !data ? <Spinner /> : data?.items.length === 0 ? (
          <Empty title="No transactions found" hint="Try different filters, or add a new transaction." />
        ) : data && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink/70 border-b border-line">
                <th className="p-3 font-medium">Date</th><th className="p-3 font-medium">Note</th><th className="p-3 font-medium">Category</th>
                <th className="p-3 font-medium">Paid with</th><th className="p-3 font-medium text-right">Amount</th><th className="p-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((t) => (
                <tr key={t._id} className="border-b border-line last:border-0">
                  <td className="p-3 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="p-3">{t.description || '—'}</td>
                  <td className="p-3">{t.category}</td>
                  <td className="p-3">{t.paymentMethod}</td>
                  <td className={`p-3 text-right whitespace-nowrap font-medium ${t.type === 'income' ? 'text-brand-dark' : ''}`}>{t.type === 'income' ? '+' : '−'}{inr(t.amount)}</td>
                  <td className="p-3 whitespace-nowrap text-right">
                    <button className="text-brand-dark underline mr-3" onClick={() => setEditing(t)}>Edit</button>
                    <button className="text-danger underline" onClick={() => remove(t)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-ink/70">{data.total} transactions · page {data.page} of {data.pages}</span>
          <div className="flex gap-2">
            <button className="btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <button className="btn-ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Add transaction' : 'Edit transaction'} onClose={() => setEditing(null)}>
          <TransactionForm initial={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
        </Modal>
      )}
    </div>
  );
}
