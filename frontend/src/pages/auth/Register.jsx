import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Field, Input } from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ErrorBanner } from '../../components/common/Loader';
import { useDocumentTitle } from '../../utils/useDocumentTitle';

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'manager' ? '/dashboard' : '/reports');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-display text-3xl text-paper leading-none">Weekly</p>
          <p className="font-display text-3xl text-accent leading-none">Ledger</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-paper-card rounded-sm p-8 space-y-5 shadow-xl animate-scaleIn">
          <h1 className="font-display text-xl text-ink mb-1">Create your account</h1>
          <ErrorBanner message={error} />

          <Field label="Full name">
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jane Perera"
            />
          </Field>

          <Field label="Email">
            <Input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@team.com"
            />
          </Field>

          <Field label="Password" hint="At least 6 characters">
            <Input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </Field>

          <Field label="I am joining as">
            <div className="flex gap-2 mt-1">
              {['member', 'manager'].map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setForm({ ...form, role: r })}
                  className={`flex-1 capitalize text-sm py-2 rounded-sm border transition-colors ${
                    form.role === r
                      ? 'border-ink bg-ink text-paper'
                      : 'border-line text-ink-faint hover:border-ink hover:bg-paper-dim'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </Field>

          <Button type="submit" variant="accent" className="w-full mt-2" loading={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>

          <p className="text-xs text-ink-faint text-center pt-2">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-dark font-medium hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
