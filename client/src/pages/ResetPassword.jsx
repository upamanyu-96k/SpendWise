import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import AuthShell from '../components/AuthShell.jsx';
import { ErrorMessage, PasswordField, StrengthMeter, SuccessMessage } from '../components/ui.jsx';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('The two passwords do not match.');
    setBusy(true);
    try {
      await api.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Pick something you haven't used before."
      footer={<Link className="font-medium text-brand hover:underline" to="/login">Back to log in</Link>}>
      {!token ? (
        <ErrorMessage message="This reset link is missing its code. Open the full link from your email, or request a new one." />
      ) : done ? (
        <div className="space-y-4">
          <SuccessMessage message="Password updated. You can now log in." />
          <Link to="/login" className="btn-primary w-full">Go to log in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <PasswordField id="password" label="New password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete="new-password" placeholder="At least 8 characters" />
          <StrengthMeter password={password} />
          <PasswordField id="confirm" label="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} autoComplete="new-password" />
          <ErrorMessage message={error} />
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Saving…' : 'Update password'}</button>
        </form>
      )}
    </AuthShell>
  );
}
