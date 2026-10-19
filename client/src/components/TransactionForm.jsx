import { useState } from 'react';
import { api } from '../services/api.js';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS } from '../constants.js';
import { toInputDate } from '../utils.js';
import { ErrorMessage, Segmented } from './ui.jsx';
import { useToast } from './toast.jsx';

export default function TransactionForm({ initial, onSaved, onCancel }) {
  const toast = useToast();
  const [form, setForm] = useState(
    initial
      ? { ...initial, date: toInputDate(initial.date), amount: String(initial.amount) }
      : { type: 'expense', amount: '', category: 'Food', description: '', paymentMethod: 'UPI', date: toInputDate(new Date()) }
  );
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const categories = form.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const changeType = (type) =>
    setForm((f) => {
      const list = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
      return { ...f, type, category: list.includes(f.category) ? f.category : list[0] };
    });

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const body = { type: form.type, amount: Number(form.amount), category: form.category, description: form.description, paymentMethod: form.paymentMethod, date: form.date };
      if (initial) await api.updateTransaction(initial._id, body);
      else await api.createTransaction(body);
      toast.success(initial ? 'Transaction updated.' : 'Transaction added.');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Segmented label="Transaction type" value={form.type} onChange={changeType} options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} />
      <div>
        <label className="label" htmlFor="amount">Amount (₹)</label>
        <input id="amount" className="input text-lg font-semibold" type="number" min="0.01" step="0.01" required autoFocus value={form.amount} onChange={set('amount')} placeholder="0.00" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" className="input" value={form.category} onChange={set('category')}>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="pm">Paid with</label>
          <select id="pm" className="input" value={form.paymentMethod} onChange={set('paymentMethod')}>
            {PAYMENT_METHODS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="date">Date</label>
        <input id="date" className="input" type="date" required value={form.date} onChange={set('date')} />
      </div>
      <div>
        <label className="label" htmlFor="desc">Note</label>
        <input id="desc" className="input" maxLength={200} placeholder="Lunch with team" value={form.description} onChange={set('description')} />
      </div>
      <ErrorMessage message={error} />
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn-primary" disabled={saving}>{saving ? 'Saving…' : initial ? 'Save changes' : 'Add transaction'}</button>
      </div>
    </form>
  );
}
