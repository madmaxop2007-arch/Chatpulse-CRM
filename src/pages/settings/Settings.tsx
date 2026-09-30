import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  Sparkles,
  Shield,
  Trash2,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { updateOrganization, setUserProfile, seedOrganizationDemoData, clearOrganizationDemoData } from '../../services/crmService';
import { testConnection, clearCustomFirebaseConfig, isFirebaseConfigured, isStorageAvailable } from '../../firebase/config';
import { useToast } from '../../contexts/ToastContext';

export const Settings: React.FC = () => {
  const { userProfile, organization, refreshProfile, refreshOrganization } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<'profile' | 'organization' | 'demo' | 'system'>('profile');

  // Profile form state
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Organization form state
  const [agencyName, setAgencyName] = useState(organization?.name || '');
  const [agencyPhone, setAgencyPhone] = useState(organization?.phone || '');
  const [agencyEmail, setAgencyEmail] = useState(organization?.email || '');
  const [location, setLocation] = useState(organization?.location || 'Gurugram, Haryana');
  const [currency, setCurrency] = useState(organization?.currency || 'INR (₹)');
  const [logoUrl, setLogoUrl] = useState(organization?.logoUrl || '');
  const [savingOrg, setSavingOrg] = useState(false);

  // Demo data state
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  // Connection test state
  const [testingConn, setTestingConn] = useState(false);
  const [connResult, setConnResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhoneNumber(userProfile.phoneNumber || '');
      setPhotoURL(userProfile.photoURL || '');
    }
  }, [userProfile]);

  useEffect(() => {
    if (organization) {
      setAgencyName(organization.name || '');
      setAgencyPhone(organization.phone || '');
      setAgencyEmail(organization.email || '');
      setLocation(organization.location || 'Gurugram, Haryana');
      setCurrency(organization.currency || 'INR (₹)');
      setLogoUrl(organization.logoUrl || '');
    }
  }, [organization]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;
    setSavingProfile(true);
    try {
      await setUserProfile({
        ...userProfile,
        displayName: displayName.trim(),
        phoneNumber: phoneNumber.trim(),
        photoURL: photoURL.trim(),
        updatedAt: new Date().toISOString(),
      });
      await refreshProfile();
      showToast('Profile updated successfully.');
    } catch (err: any) {
      showToast('Failed to update profile: ' + err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    setSavingOrg(true);
    try {
      await updateOrganization(organization.id, {
        name: agencyName.trim(),
        phone: agencyPhone.trim(),
        email: agencyEmail.trim(),
        location: location.trim(),
        currency,
        logoUrl: logoUrl.trim(),
      });
      await refreshOrganization();
      showToast('Agency settings saved successfully.');
    } catch (err: any) {
      showToast('Failed to update agency: ' + err.message, 'error');
    } finally {
      setSavingOrg(false);
    }
  };

  const handleSeedDemo = async () => {
    if (!organization?.id || !userProfile?.uid) return;
    setSeeding(true);
    try {
      const res = await seedOrganizationDemoData(
        organization.id,
        userProfile.uid,
        userProfile.displayName || 'Agent'
      );
      showToast(
        `Loaded demo set: ${res.leads} Leads, ${res.properties} Properties, ${res.clients} Clients!`,
        'success'
      );
    } catch (err: any) {
      showToast('Failed to seed demo data: ' + err.message, 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleClearDemo = async () => {
    if (!organization?.id) return;
    setClearing(true);
    try {
      const count = await clearOrganizationDemoData(organization.id);
      showToast(`Removed ${count} sample records from your agency.`);
      setClearDialogOpen(false);
    } catch (err: any) {
      showToast('Failed to clear demo data: ' + err.message, 'error');
    } finally {
      setClearing(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConn(true);
    setConnResult(null);
    try {
      const res = await testConnection();
      setConnResult(res);
    } catch (err: any) {
      setConnResult({ success: false, message: err.message || 'Connection test failed.' });
    } finally {
      setTestingConn(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          System Settings &amp; Preferences
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Agency profile, demo data utilities, and database connectivity
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        <button
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition border-b-2 -mb-1 shrink-0 ${
            tab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4" /> Personal Profile
        </button>

        <button
          onClick={() => setTab('organization')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition border-b-2 -mb-1 shrink-0 ${
            tab === 'organization'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" /> Agency Information
        </button>

        <button
          onClick={() => setTab('demo')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition border-b-2 -mb-1 shrink-0 ${
            tab === 'demo'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Demo Data Seeder
        </button>

        <button
          onClick={() => setTab('system')}
          className={`flex items-center gap-2 px-3 py-2 text-xs font-bold transition border-b-2 -mb-1 shrink-0 ${
            tab === 'system'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Database className="w-4 h-4" /> Backend Health &amp; Rules
        </button>
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <Card title="Agent Profile" subtitle="Your personal credentials and broker details">
          <form onSubmit={handleSaveProfile} className="max-w-xl flex flex-col gap-4">
            {/* Avatar Preview & URL */}
            <div className="flex items-center gap-3.5 pb-2">
              <div className="w-14 h-14 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 shadow-xs">
                {photoURL ? (
                  <img src={photoURL} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  label="Profile Avatar URL (Optional)"
                  placeholder="https://images.unsplash.com/... or direct image URL"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  helperText="Attach an avatar via direct image URL (Storage is disabled on Spark plan)."
                />
              </div>
            </div>

            <Input
              label="Full Name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <Input
              label="Email Address"
              type="email"
              disabled
              helperText="Email cannot be changed directly (Firebase Auth credential)"
              value={userProfile?.email || ''}
            />

            <Input
              label="Contact Phone"
              type="tel"
              placeholder="+91 98112 34567"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />

            <div className="pt-2">
              <Button type="submit" loading={savingProfile}>
                Save Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Organization Tab */}
      {tab === 'organization' && (
        <Card title="Agency Profile" subtitle="Brokerage details displayed across reports and listings">
          <form onSubmit={handleSaveOrg} className="max-w-xl flex flex-col gap-4">
            {/* Logo Preview & URL */}
            <div className="flex items-center gap-3.5 pb-2">
              <div className="w-14 h-14 rounded-xl border border-slate-200 overflow-hidden bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo preview" className="w-full h-full object-contain" />
                ) : (
                  <Building className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  label="Agency Logo URL (Optional)"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  helperText="Direct logo URL displayed on sidebar, header, and exports."
                />
              </div>
            </div>

            <Input
              label="Agency Trade Name"
              required
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Official Phone"
                value={agencyPhone}
                onChange={(e) => setAgencyPhone(e.target.value)}
              />
              <Input
                label="Official Email"
                type="email"
                value={agencyEmail}
                onChange={(e) => setAgencyEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Primary City / Headquarters"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Select
                label="Operating Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { value: 'INR (₹)', label: 'Indian Rupee (INR - ₹)' },
                  { value: 'USD ($)', label: 'US Dollar (USD - $)' },
                  { value: 'AED (د.إ)', label: 'UAE Dirham (AED - د.إ)' },
                ]}
              />
            </div>

            <div className="pt-2">
              <Button type="submit" loading={savingOrg}>
                Update Agency Settings
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Demo Data Management */}
      {tab === 'demo' && (
        <div className="flex flex-col gap-6 max-w-3xl">
          <Card
            title="Real Estate Demo Data Seeder"
            subtitle="Populate realistic Indian property listings, leads, clients, and pipeline deals"
          >
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                <p className="font-semibold text-slate-900 mb-1">
                  What will be seeded into your current agency:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>20 Leads across DLF Phase 1/2, Golf Course Ext, Sector 57, Dwarka</li>
                  <li>15 High-res sample properties (Apartments, Villas, Retail, Offices)</li>
                  <li>10 Verified buyers, investors, and sellers</li>
                  <li>10 Follow-ups &amp; 10 Tasks</li>
                  <li>8 Site visits &amp; 8 Deals in pipeline</li>
                </ul>
                <p className="mt-2 text-[11px] text-slate-500">
                  All demo records are clearly marked with <code>isDemo: true</code> and isolated strictly to your organization.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="md"
                  loading={seeding}
                  onClick={handleSeedDemo}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Seed Demo Data
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setClearDialogOpen(true)}
                  icon={<Trash2 className="w-4 h-4 text-rose-500" />}
                  className="text-rose-700 border-rose-200 hover:bg-rose-50"
                >
                  Clear Demo Data
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Backend Health & System Info */}
      {tab === 'system' && (
        <div className="flex flex-col gap-6 max-w-3xl">
          <Card title="Firebase Connectivity Diagnostics">
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <span className="font-bold text-slate-900 block">Configuration Status</span>
                  <span className="text-slate-500 text-[11px]">
                    {isFirebaseConfigured
                      ? 'Environment variables / custom configuration loaded'
                      : 'Not configured'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-bold">
                  {isFirebaseConfigured ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Active
                    </span>
                  ) : (
                    <span className="text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" /> Missing
                    </span>
                  )}
                </div>
              </div>

              {/* Service Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Auth</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Ready</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Multi-tenant email/password sessions</p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Cloud Firestore</span>
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Primary DB</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Hardened security rules & persistence</p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Cloud Storage</span>
                    {isStorageAvailable ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">Spark (URLs)</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {isStorageAvailable ? 'File uploads active' : 'Optional: Uses direct image URLs'}
                  </p>
                </div>
              </div>

              {connResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    connResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {connResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{connResult.message}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  loading={testingConn}
                  onClick={handleTestConnection}
                  icon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Test Firestore Server Ping
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearCustomFirebaseConfig}
                  className="text-slate-500 hover:text-rose-600"
                >
                  Reset Local Storage Config
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Confirm Clear Demo Dialog */}
      <ConfirmDialog
        isOpen={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        onConfirm={handleClearDemo}
        title="Clear Demo Data"
        message="Are you sure you want to remove all seeded sample leads, properties, and deals from your agency? Real client data will not be touched."
        confirmLabel="Clear Demo Records"
        loading={clearing}
      />
    </div>
  );
};
