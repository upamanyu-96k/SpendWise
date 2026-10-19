import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import AuthShell from '../components/AuthShell.jsx';
import Icon from '../components/Icons.jsx';
import { ErrorMessage } from '../components/ui.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Forgot your password?" subtitle="Enter your email and we'll send you a link to choose a new one."
      footer={<Link className="font-medium text-brand hover:underline" to="/login">Back to log in</Link>}>
      {sent ? (
        <div className="card text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-good/10 text-good"><Icon name="mail" className="size-6" /></div>
          <p className="font-medium">Check your email</p>
          <p className="mt-1 text-sm text-muted">If an account exists for {email}, a reset link is on its way. It works for 30 minutes.</p>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="you@example.com" />
          </div>
          <ErrorMessage message={error} />
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</button>
        </form>
      )}
    </AuthShell>
  );
}
