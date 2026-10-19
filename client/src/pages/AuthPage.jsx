import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import AuthShell from '../components/AuthShell.jsx';
import { ErrorMessage, PasswordField, StrengthMeter } from '../components/ui.jsx';

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
    <AuthShell
      title={isLogin ? 'Welcome back' : 'Create your account'}
      subtitle={isLogin ? 'Log in to see where your money went.' : 'Start tracking your spending in a minute.'}
      footer={<>{isLogin ? 'New to SpendWise? ' : 'Already have an account? '}<Link className="font-medium text-brand hover:underline" to={isLogin ? '/register' : '/login'}>{isLogin ? 'Create an account' : 'Log in'}</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="label" htmlFor="name">Name</label>
            <input id="name" className="input" required value={form.name} onChange={set('name')} autoComplete="name" placeholder="Your name" />
          </div>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" type="email" className="input" required value={form.email} onChange={set('email')} autoComplete="email" placeholder="you@example.com" />
        </div>
        <PasswordField id="password" label="Password" value={form.password} onChange={set('password')} minLength={isLogin ? 1 : 8} autoComplete={isLogin ? 'current-password' : 'new-password'} placeholder={isLogin ? 'Your password' : 'At least 8 characters'} />
        {!isLogin && <StrengthMeter password={form.password} />}
        {isLogin && <div className="text-right"><Link to="/forgot-password" className="text-sm text-brand hover:underline">Forgot password?</Link></div>}
        <ErrorMessage message={error} />
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}</button>
      </form>
    </AuthShell>
  );
}
