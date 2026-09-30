import React, { useState } from 'react';
import { Building2, Sparkles, ArrowRight, Check, MapPin, Phone, Mail, DollarSign } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateOrganization, seedOrganizationDemoData } from '../../services/crmService';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { useToast } from '../../contexts/ToastContext';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { organization, userProfile, refreshOrganization } = useAuth();
  const { showToast } = useToast();

  const [agencyName, setAgencyName] = useState(organization?.name || '');
  const [agencyPhone, setAgencyPhone] = useState(organization?.phone || '');
  const [agencyEmail, setAgencyEmail] = useState(organization?.email || '');
  const [location, setLocation] = useState('Gurugram, Haryana');
  const [currency, setCurrency] = useState('INR (₹)');
  const [logoUrl, setLogoUrl] = useState(organization?.logoUrl || '');
  const [saving, setSaving] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);

  const handleSaveAndContinue = async () => {
    if (!organization?.id) {
      onComplete();
      return;
    }
    setSaving(true);
    try {
      await updateOrganization(organization.id, {
        name: agencyName,
        phone: agencyPhone,
        email: agencyEmail,
        location,
        currency,
        logoUrl: logoUrl.trim(),
      });
      await refreshOrganization();
      showToast('Agency profile configured successfully!');
      onComplete();
    } catch (err: any) {
      console.error('Error saving onboarding data:', err);
      showToast('Could not save agency settings. Skipping...', 'error');
      onComplete();
    } finally {
      setSaving(false);
    }
  };

  const handleSeedDemoData = async () => {
    if (!organization?.id || !userProfile?.uid) return;
    setSeedingDemo(true);
    try {
      const res = await seedOrganizationDemoData(
        organization.id,
        userProfile.uid,
        userProfile.displayName || 'Agent'
      );
      showToast(
        `Seeded ${res.leads} leads, ${res.properties} properties, ${res.clients} clients, and deals!`,
        'success'
      );
      onComplete();
    } catch (err: any) {
      console.error('Error seeding demo data:', err);
      showToast('Failed to seed demo data. You can try again in Settings.', 'error');
    } finally {
      setSeedingDemo(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-2xl w-full flex flex-col gap-6">
        <div className="text-center">
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold tracking-tight inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            Agency Setup &amp; Configuration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3 font-display">
            Welcome to ChatPulse CRM
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
            Personalize your real estate brokerage workspace and configure default settings.
          </p>
        </div>

        <Card className="shadow-lg border-slate-200">
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Agency Trade Name"
                placeholder="e.g. PrimeSpace Realty"
                icon={<Building2 className="w-4 h-4" />}
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
              />
              <Input
                label="Primary Agency Location / City"
                placeholder="e.g. Gurugram, Delhi NCR"
                icon={<MapPin className="w-4 h-4" />}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Agency Official Phone"
                placeholder="+91 98112 34567"
                icon={<Phone className="w-4 h-4" />}
                value={agencyPhone}
                onChange={(e) => setAgencyPhone(e.target.value)}
              />
              <Input
                label="Official Contact Email"
                placeholder="contact@primespace.in"
                icon={<Mail className="w-4 h-4" />}
                value={agencyEmail}
                onChange={(e) => setAgencyEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Agency Logo URL (Optional)"
                placeholder="https://example.com/logo.png"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                helperText="Optional direct link to your agency emblem or logo."
              />

              <Select
                label="Default Operating Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { value: 'INR (₹)', label: 'Indian Rupee (INR - ₹)' },
                  { value: 'USD ($)', label: 'US Dollar (USD - $)' },
                  { value: 'AED (د.إ)', label: 'UAE Dirham (AED - د.إ)' },
                ]}
              />
            </div>

            {/* Optional Demo Data Box */}
            <div className="mt-2 p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 via-indigo-50/40 to-slate-50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-950">Pre-load Realistic Indian Demo Data</h4>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    Instant 20 Leads, 15 Properties (DLF Phase 1/2, Golf Course Ext, Sector 57), 10 Clients, and Deals pipeline to explore the CRM right away.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={seedingDemo}
                onClick={handleSeedDemoData}
                className="shrink-0 bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold"
              >
                Load Demo Data
              </Button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onComplete}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition"
              >
                Skip for now
              </button>

              <Button
                type="button"
                size="md"
                loading={saving}
                onClick={handleSaveAndContinue}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Save &amp; Open Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
