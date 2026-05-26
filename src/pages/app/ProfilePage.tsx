import { useState } from 'react';
import type { FormEvent } from 'react';
import { BadgeCheck, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../bank/AuthContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
  });
  const [saved, setSaved] = useState(false);
  const [kycPending, setKycPending] = useState(false);

  if (!user) return null;

  function submit(e: FormEvent) {
    e.preventDefault();
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <PageHeader title={t('profilePage.title')} subtitle={t('profilePage.subtitle')} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 p-6">
          <h2
            className="text-2xl font-medium text-black mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Personal info
          </h2>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t('profilePage.firstName')}
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
              <Input
                label={t('profilePage.lastName')}
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
            <Input label={t('profilePage.email')} value={user.email} disabled />
            <Input
              label={t('profilePage.phone')}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <div className="flex items-center gap-3">
              <Button type="submit">{t('profilePage.save')}</Button>
              {saved && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <BadgeCheck className="w-4 h-4" /> {t('profilePage.saved')}
                </span>
              )}
            </div>
          </form>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-6">
          <h2
            className="text-2xl font-medium text-black mb-4"
            style={{ letterSpacing: '-0.02em' }}
          >
            Verification
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#2B2644] text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-black/60">Current level</div>
              <div className="text-lg font-medium text-black capitalize">{user.kycLevel}</div>
            </div>
          </div>
          {user.kycLevel === 'basic' ? (
            <>
              <p className="text-sm text-black/60 mb-4">
                Upgrade to Verified to unlock higher transfer limits and crypto withdrawals.
              </p>
              {kycPending ? (
                <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3">
                  KYC documents submitted. Pending review.
                </div>
              ) : (
                <Button onClick={() => setKycPending(true)} className="w-full">
                  Upload KYC documents
                </Button>
              )}
            </>
          ) : (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              Your account is fully verified.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
