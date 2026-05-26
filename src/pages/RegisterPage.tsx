import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../bank/AuthContext';
import { LogoIcon } from '../components/LogoIcon';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/app/dashboard" replace />;

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.password.length < 6) {
      setError(t('auth.passwordMin'));
      return;
    }
    if (form.password !== form.confirm) {
      setError(t('auth.passwordsMismatch'));
      return;
    }
    setSubmitting(true);
    const result = await register({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      password: form.password,
    });
    setSubmitting(false);
    if (result.ok) {
      navigate('/app/dashboard');
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-8 flex flex-col">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-black/60 hover:text-black transition-colors self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        Halo Bank
      </Link>

      <div className="flex-1 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center">
          <LogoIcon className="w-7 h-7 text-black" />
          <span className="text-2xl font-medium tracking-tight text-black">Halo Bank</span>
        </Link>

        <div className="bg-white rounded-2xl p-10 shadow-sm border border-black/5">
          <h1
            className="text-3xl font-medium text-black mb-2"
            style={{ letterSpacing: '-0.03em' }}
          >
            {t('auth.openYourAccount')}
          </h1>
          <p className="text-black/60 text-sm mb-8">
            {t('auth.registerSubtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('auth.firstName')}
                required
                value={form.firstName}
                onChange={(e) => update('firstName', e.target.value)}
              />
              <Input
                label={t('auth.lastName')}
                required
                value={form.lastName}
                onChange={(e) => update('lastName', e.target.value)}
              />
            </div>
            <Input
              label={t('auth.email')}
              type="email"
              required
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label={t('auth.phone')}
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="+380 50 123 4567"
            />
            <Input
              label={t('auth.password')}
              type="password"
              required
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder={t('auth.atLeast6')}
            />
            <Input
              label={t('auth.confirmPassword')}
              type="password"
              required
              value={form.confirm}
              onChange={(e) => update('confirm', e.target.value)}
            />

            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? t('auth.creatingAccount') : t('auth.createAccount')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-sm text-black/60 mt-6 text-center">
            {t('auth.alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-black font-medium hover:underline">
              {t('auth.signIn')}
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
