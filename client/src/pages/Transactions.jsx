import { useState } from 'react';
import { api } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import Icon from '../components/Icons.jsx';
import { CategoryAvatar, Empty, ErrorMessage, Modal, PageHeader, Segmented, Skeleton } from '../components/ui.jsx';
import { useToast } from '../components/toast.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants.js';
import { formatDate, inr } from '../utils.js';

const ALL = [...new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES])];
const emptyFilters = { q: '', type: '', category: '', paymentMethod: '', from: '', to: '', minAmount: '', maxAmount: '' };

export default function Transactions() {
  const toast = useToast();
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [showMore, setShowMore] = useState(false);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null); // null | 'new' | transaction
  const [toDelete, setToDelete] = useState(null);
  const { data, loading, error, reload } = useAsync(() => api.transactions({ ...applied, page, limit: 12 }), [applied, page]);
  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const apply = (e) => { e?.preventDefault(); setPage(1); setApplied(filters); };
  const reset = () => { setFilters(emptyFilters); setApplied(emptyFilters); setPage(1); };
  const pickType = (type) => { const next = { ...filters, type }; setFilters(next); setApplied(next); setPage(1); };
  const activeCount = Object.values(applied).filter(Boolean).length;

  async function confirmDelete() {
    try {
      await api.deleteTransaction(toDelete._id);
      toast.success('Transaction deleted.');
      setToDelete(null);
      reload();
    } catch (e) {
      toast.error(e.message);
      setToDelete(null);
    }
  }

  async function exportCsv() {
    try { await api.exportTransactions(); toast.success('Your transactions were downloaded.'); } catch (e) { toast.error(e.message); }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Transactions" subtitle="Everything you've earned and spent.">
        <button className="btn-ghost" onClick={exportCsv}><Icon name="download" className="size-4" />Export CSV</button>
        <button className="btn-primary" onClick={() => setEditing('new')}><Icon name="plus" className="size-4" />Add transaction</button>
      </PageHeader>

      <form onSubmit={apply} className="card space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input aria-label="Search notes" className="input pl-10" value={filters.q} onChange={set('q')} placeholder="Search notes…" />
          </div>
          <Segmented label="Type" value={filters.type} onChange={pickType} options={[{ value: '', label: 'All' }, { value: 'expense', label: 'Expenses' }, { value: 'income', label: 'Income' }]} />
          <button type="button" className="btn-ghost" onClick={() => setShowMore((s) => !s)} aria-expanded={showMore}>
            <Icon name="filter" className="size-4" />Filters{activeCount > 0 && <span className="rounded-full bg-brand px-1.5 text-xs text-brand-fg">{activeCount}</span>}
          </button>
        </div>
        {showMore && (
          <div className="grid grid-cols-2 gap-3 border-t border-line pt-4 md:grid-cols-3 lg:grid-cols-6">
            <div><label className="label" htmlFor="fcat">Category</label><select id="fcat" className="input" value={filters.category} onChange={set('category')}><option value="">All</option>{ALL.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label" htmlFor="fpm">Paid with</label><select id="fpm" className="input" value={filters.paymentMethod} onChange={set('paymentMethod')}><option value="">All</option>{PAYMENT_METHODS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div><label className="label" htmlFor="from">From</label><input id="from" type="date" className="input" value={filters.from} onChange={set('from')} /></div>
            <div><label className="label" htmlFor="to">To</label><input id="to" type="date" className="input" value={filters.to} onChange={set('to')} /></div>
            <div><label className="label" htmlFor="min">Min ₹</label><input id="min" type="number" min="0" className="input" value={filters.minAmount} onChange={set('minAmount')} /></div>
            <div><label className="label" htmlFor="max">Max ₹</label><input id="max" type="number" min="0" className="input" value={filters.maxAmount} onChange={set('maxAmount')} /></div>
          </div>
        )}
        <div className="flex justify-end gap-2">
          {activeCount > 0 && <button type="button" className="btn-ghost" onClick={reset}>Clear</button>}
          <button className="btn-primary">Apply</button>
        </div>
      </form>

      <ErrorMessage message={error} />

      <div className="card p-2 md:p-3">
        {loading && !data ? (
          <div className="space-y-2 p-2"><Skeleton className="h-16" /><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
        ) : data?.items.length === 0 ? (
          <Empty icon="list" title="No transactions found" hint={activeCount ? 'Try removing a filter.' : 'Add your first transaction to get started.'}>
            {!activeCount && <button className="btn-primary" onClick={() => setEditing('new')}><Icon name="plus" className="size-4" />Add transaction</button>}
          </Empty>
        ) : data && (
          <ul className="divide-y divide-line">
            {data.items.map((t) => (
              <li key={t._id} className="group flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-raised/60 md:px-3">
                <CategoryAvatar category={t.category} className="size-11 text-xl" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{t.description || t.category}</p>
                  <p className="text-xs text-muted">{t.category} · {t.paymentMethod} · {formatDate(t.date)}</p>
                </div>
                <p className={`whitespace-nowrap font-semibold ${t.type === 'income' ? 'text-good' : ''}`}>{t.type === 'income' ? '+' : '−'}{inr(t.amount)}</p>
                <div className="flex md:opacity-0 md:transition md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                  <button className="icon-btn" onClick={() => setEditing(t)} aria-label={`Edit ${t.description || t.category}`}><Icon name="edit" className="size-4" /></button>
                  <button className="icon-btn hover:text-bad" onClick={() => setToDelete(t)} aria-label={`Delete ${t.description || t.category}`}><Icon name="trash" className="size-4" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">{data.total} transactions · page {data.page} of {data.pages}</span>
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

      {toDelete && (
        <Modal title="Delete transaction?" onClose={() => setToDelete(null)}>
          <p className="text-sm text-muted">This will permanently delete <span className="font-medium text-main">{toDelete.description || toDelete.category}</span> ({inr(toDelete.amount)}).</p>
          <div className="mt-6 flex justify-end gap-2">
            <button className="btn-ghost" onClick={() => setToDelete(null)}>Cancel</button>
            <button className="btn-danger" onClick={confirmDelete}>Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
