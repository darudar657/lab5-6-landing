import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../bank/AuthContext';
import { LogoIcon } from '../components/LogoIcon';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/app/dashboard" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(email, password);
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
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-10 justify-center">
          <LogoIcon className="w-7 h-7 text-black" />
          <span className="text-2xl font-medium tracking-tight text-black">Halo Bank</span>
        </Link>

        <div className="bg-white rounded-2xl p-10 shadow-sm border border-black/5">
          <h1
            className="text-3xl font-medium text-black mb-2"
            style={{ letterSpacing: '-0.03em' }}
          >
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-black/60 text-sm mb-8">{t('auth.signInSubtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            <Input
              label={t('auth.password')}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? t('auth.signingIn') : t('auth.signIn')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-sm text-black/60 mt-6 text-center">
            {t('auth.newToHalo')}{' '}
            <Link to="/register" className="text-black font-medium hover:underline">
              {t('auth.openAccount')}
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
