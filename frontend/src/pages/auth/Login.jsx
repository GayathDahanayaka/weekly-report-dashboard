import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Field, Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/Loader';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'manager' ? '/dashboard' : '/reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl text-paper leading-none">Weekly</p>
          <p className="font-display text-3xl text-accent leading-none">Ledger</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper-card rounded-sm p-8 space-y-5 shadow-xl">
          <h1 className="font-display text-xl text-ink mb-1">Sign in</h1>
          <ErrorBanner message={error} />

          <Field label="Email">
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@team.com"
            />
          </Field>

          <Field label="Password">
            <Input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </Field>

          <Button type="submit" variant="accent" className="w-full mt-2" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>

          <p className="text-xs text-ink-faint text-center pt-2">
            New here?{' '}
            <Link to="/register" className="text-accent-dark font-medium">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
