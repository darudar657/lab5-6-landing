import { useState } from 'react';
import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../bank/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function SettingsPage() {
  const { user, changePassword, updateUser } = useAuth();
  const { t, i18n } = useTranslation();
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pwSubmitting, setPwSubmitting] = useState(false);

  if (!user) return null;

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.next.length < 6) {
      setPwMsg({ type: 'err', text: t('auth.passwordMin') });
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'err', text: t('auth.passwordsMismatch') });
      return;
    }
    setPwSubmitting(true);
    const result = await changePassword(pwForm.current, pwForm.next);
    setPwSubmitting(false);
    if (result.ok) {
      setPwMsg({ type: 'ok', text: 'Password updated' });
      setPwForm({ current: '', next: '', confirm: '' });
    } else {
      setPwMsg({ type: 'err', text: result.error });
    }
  }

  return (
    <div>
      <PageHeader title={t('settingsPage.title')} subtitle={t('settingsPage.subtitle')} />

      <div className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h2
            className="text-2xl font-medium text-black mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            {t('settingsPage.language')}
          </h2>
          <div className="flex gap-3">
            <Button
              variant={i18n.language === 'en' ? 'primary' : 'secondary'}
              onClick={() => i18n.changeLanguage('en')}
            >
              English
            </Button>
            <Button
              variant={i18n.language === 'uk' ? 'primary' : 'secondary'}
              onClick={() => i18n.changeLanguage('uk')}
            >
              Українська
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h2
            className="text-2xl font-medium text-black mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            {t('settingsPage.security')}
          </h2>
          <form onSubmit={submitPassword} className="space-y-4 max-w-md">
            <Input
              label={t('settingsPage.currentPassword')}
              type="password"
              required
              value={pwForm.current}
              onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
            />
            <Input
              label={t('settingsPage.newPassword')}
              type="password"
              required
              value={pwForm.next}
              onChange={(e) => setPwForm((f) => ({ ...f, next: e.target.value }))}
            />
            <Input
              label={t('settingsPage.confirmNew')}
              type="password"
              required
              value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
            />
            {pwMsg && (
              <div
                className={`text-sm rounded-xl px-4 py-3 border ${
                  pwMsg.type === 'ok'
                    ? 'text-green-700 bg-green-50 border-green-200'
                    : 'text-red-600 bg-red-50 border-red-200'
                }`}
              >
                {pwMsg.text}
              </div>
            )}
            <Button type="submit" disabled={pwSubmitting}>
              {pwSubmitting ? 'Updating…' : t('settingsPage.updatePassword')}
            </Button>
          </form>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5">
            <div>
              <div className="text-base font-medium text-black">Two-factor authentication</div>
              <div className="text-sm text-black/60">
                Add an extra layer of security to your sign-ins.
              </div>
            </div>
            <button
              type="button"
              onClick={() => updateUser({ twoFa: !user.twoFa })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                user.twoFa ? 'bg-black' : 'bg-black/10'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  user.twoFa ? 'translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6 border-red-200 bg-red-50/30">
          <h2
            className="text-2xl font-medium text-red-600 mb-2"
            style={{ letterSpacing: '-0.02em' }}
          >
            {t('settingsPage.dangerZone')}
          </h2>
          <p className="text-sm text-red-600/80 mb-4">
            {t('settingsPage.deleteDesc')}
          </p>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => {
              // Not implemented in demo
              alert('Not implemented in demo project.');
            }}
          >
            {t('settingsPage.deleteConfirm')}
          </Button>
        </div>
      </div>
    </div>
  );
}
