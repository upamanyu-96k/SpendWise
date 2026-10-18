import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ErrorMessage } from '../components/ui.jsx';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isLogin) await login({ email: form.email, password: form.password });
      else await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="font-display text-4xl mb-1">SpendWise</h1>
        <p className="text-ink/70 mb-6">{isLogin ? 'Log in to see where your money went.' : 'Create an account to start tracking your spending.'}</p>
        <form onSubmit={submit} className="card space-y-4">
          {!isLogin && (
            <div>
              <label className="label" htmlFor="name">Name</label>
              <input id="name" className="input" required value={form.name} onChange={set('name')} autoComplete="name" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" className="input" required value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" className="input" required minLength={isLogin ? 1 : 8} value={form.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} />
            {!isLogin && <p className="text-xs text-ink/60 mt-1">At least 8 characters.</p>}
          </div>
          <ErrorMessage message={error} />
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
        </form>
        <p className="text-sm text-center mt-4">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <Link className="text-brand-dark underline" to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link>
        </p>
      </div>
    </div>
  );
}
