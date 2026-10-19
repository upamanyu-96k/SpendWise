import { useState } from 'react';
import { api } from '../services/api.js';
import { useAsync } from '../hooks/useAsync.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { useTheme } from '../theme.jsx';
import Icon from '../components/Icons.jsx';
import { ErrorMessage, Modal, PageHeader, PasswordField, Segmented, StrengthMeter } from '../components/ui.jsx';
import { useToast } from '../components/toast.jsx';
import { formatDate, initials } from '../utils.js';

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'appearance', label: 'Appearance' },
  { value: 'security', label: 'Security' },
  { value: 'data', label: 'Data & account' },
];

function Section({ title, hint, children }) {
  return (
    <section className="card">
      <h2 className="font-semibold">{title}</h2>
      {hint && <p className="mb-5 mt-1 text-sm text-muted">{hint}</p>}
      {!hint && <div className="mb-4" />}
      {children}
    </section>
  );
}

function ProfileTab() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const emailChanged = email.trim().toLowerCase() !== user.email;
  const changed = emailChanged || name.trim() !== user.name;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = { name: name.trim() };
      if (emailChanged) Object.assign(body, { email, currentPassword: password });
      const r = await api.updateProfile(body);
      setUser(r.user);
      setPassword('');
      toast.success('Profile updated.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Personal details" hint="This is how you appear in SpendWise.">
      <form onSubmit={submit} className="max-w-lg space-y-4">
        <div>
          <label className="label" htmlFor="pname">Name</label>
          <input id="pname" className="input" required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="pemail">Email</label>
          <input id="pemail" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        {emailChanged && (
          <PasswordField id="ppass" label="Current password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" hint="Confirm your password to change your email." />
        )}
        <ErrorMessage message={error} />
        <button className="btn-primary" disabled={busy || !changed}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </Section>
  );
}

function AppearanceTab() {
  const { preference, setPreference } = useTheme();
  const options = [
    { value: 'light', label: 'Light', icon: 'sun', bg: '#F4F6FB', bar: '#0D9488', card: '#FFFFFF' },
    { value: 'dark', label: 'Dark', icon: 'moon', bg: '#080B16', bar: '#2DD4BF', card: '#0F1526' },
    { value: 'system', label: 'System', icon: 'monitor', bg: 'linear-gradient(90deg,#F4F6FB 50%,#080B16 50%)', bar: '#14B8A6', card: 'transparent' },
  ];
  return (
    <Section title="Theme" hint="Choose how SpendWise looks. Your choice is remembered on this device.">
      <div className="grid gap-4 sm:grid-cols-3">
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => setPreference(o.value)} aria-pressed={preference === o.value}
            className={`rounded-2xl border p-3 text-left transition ${preference === o.value ? 'border-brand bg-brand/10 ring-2 ring-brand/30' : 'border-line hover:bg-raised'}`}>
            <span className="block h-24 overflow-hidden rounded-xl border border-line p-3" style={{ background: o.bg }}>
              <span className="block h-2 w-10 rounded-full" style={{ background: o.bar }} />
              <span className="mt-3 block h-8 rounded-lg" style={{ background: o.card, boxShadow: 'inset 0 0 0 1px rgba(128,128,128,.25)' }} />
            </span>
            <span className="mt-3 flex items-center gap-2 text-sm font-medium"><Icon name={o.icon} className="size-4" />{o.label}{preference === o.value && <Icon name="check" className="ml-auto size-4 text-brand" />}</span>
          </button>
        ))}
      </div>
    </Section>
  );
}

function SecurityTab() {
  const toast = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (form.next !== form.confirm) return setError('The new passwords do not match.');
    setBusy(true);
    try {
      await api.changePassword({ currentPassword: form.current, newPassword: form.next });
      setForm({ current: '', next: '', confirm: '' });
      toast.success('Password changed.');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title="Change password" hint="Use at least 8 characters. A mix of letters, numbers and symbols is stronger.">
      <form onSubmit={submit} className="max-w-lg space-y-4">
        <PasswordField id="cur" label="Current password" value={form.current} onChange={set('current')} autoComplete="current-password" />
        <PasswordField id="new" label="New password" value={form.next} onChange={set('next')} minLength={8} autoComplete="new-password" />
        <StrengthMeter password={form.next} />
        <PasswordField id="conf" label="Confirm new password" value={form.confirm} onChange={set('confirm')} minLength={8} autoComplete="new-password" />
        <ErrorMessage message={error} />
        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
        <p className="text-xs text-muted">Forgot your current password? Log out and use "Forgot password?" on the login page.</p>
      </form>
    </Section>
  );
}

function DataTab() {
  const { logout } = useAuth();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function exportCsv() {
    try { await api.exportTransactions(); toast.success('Your transactions were downloaded.'); } catch (e) { toast.error(e.message); }
  }

  async function deleteAccount(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.deleteAccount({ password });
      toast.success('Your account was deleted.');
      logout();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Section title="Export your data" hint="Download every transaction as a CSV file you can open in Excel or Google Sheets.">
        <button className="btn-ghost" onClick={exportCsv}><Icon name="download" className="size-4" />Download CSV</button>
      </Section>

      <section className="card border-bad/30">
        <h2 className="font-semibold text-bad">Delete account</h2>
        <p className="mb-5 mt-1 text-sm text-muted">Permanently deletes your account, transactions and budgets. This cannot be undone.</p>
        <button className="btn-danger" onClick={() => setConfirming(true)}><Icon name="trash" className="size-4" />Delete my account</button>
      </section>

      {confirming && (
        <Modal title="Delete your account?" onClose={() => setConfirming(false)}>
          <form onSubmit={deleteAccount} className="space-y-4">
            <p className="text-sm text-muted">Everything will be removed for good. Enter your password to confirm.</p>
            <PasswordField id="delpass" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <ErrorMessage message={error} />
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setConfirming(false)}>Cancel</button>
              <button className="btn-danger" disabled={busy}>{busy ? 'Deleting…' : 'Delete forever'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('profile');
  const { data } = useAsync(() => api.me(), []);

  return (
    <div className="space-y-6">
      <PageHeader title="Your profile" subtitle="Manage your account and preferences." />

      <section className="card flex flex-wrap items-center gap-5">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-violet-500 text-xl font-semibold text-brand-fg shadow-glow">{initials(user.name)}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xl font-semibold">{user.name}</p>
          <p className="truncate text-sm text-muted">{user.email}</p>
          <p className="mt-1 text-xs text-muted">Member since {user.createdAt ? formatDate(user.createdAt) : '—'}</p>
        </div>
        {data && (
          <div className="flex gap-6 text-center">
            <div><p className="text-xl font-semibold">{data.stats.transactions}</p><p className="text-xs text-muted">Transactions</p></div>
            <div><p className="text-xl font-semibold">{data.stats.budgets}</p><p className="text-xs text-muted">Budgets</p></div>
          </div>
        )}
        <button onClick={logout} className="btn-ghost md:hidden"><Icon name="logout" className="size-4" />Log out</button>
      </section>

      <div className="overflow-x-auto pb-1"><Segmented label="Profile sections" value={tab} onChange={setTab} options={TABS} /></div>

      {tab === 'profile' && <ProfileTab />}
      {tab === 'appearance' && <AppearanceTab />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'data' && <DataTab />}
    </div>
  );
}
