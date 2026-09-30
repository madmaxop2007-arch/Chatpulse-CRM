import React, { useState } from 'react';
import { Building, User, Mail, Lock, Phone, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { isValidPhone, isValidEmail } from '../../utils/formatters';

interface RegisterProps {
  onGoToLogin: () => void;
  onRegistered: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onGoToLogin, onRegistered }) => {
  const { registerAgency } = useAuth();
  const [fullName, setFullName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !agencyName || !email || !phoneNumber || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid work email.');
      return;
    }
    if (!isValidPhone(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await registerAgency({
        fullName: fullName.trim(),
        agencyName: agencyName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim(),
      });
      onRegistered();
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please log in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password.');
      } else {
        setError(err.message || 'Failed to create agency account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-indigo-500 selection:text-white">
      {/* Container Frame */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800/20">
        
        {/* Left Side: Real Estate Architectural Showcase Panel */}
        <div className="lg:col-span-5 bg-[#0B0F19] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Mark */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight font-display text-white">ChatPulse CRM</span>
                <span className="text-[10px] text-indigo-400 block font-semibold uppercase tracking-widest">
                  Agency Setup
                </span>
              </div>
            </div>

            <div className="mt-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-500/20 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Enterprise Multi-Tenant
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight font-display">
                Create an isolated workspace for your brokerage.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                Empower your agents to track qualified buyers, schedule tours, close deals, and build client trust with enterprise-grade data isolation.
              </p>
            </div>
          </div>

          {/* Bottom Security / Trust */}
          <div className="relative z-10 space-y-3 border-t border-slate-800/80 pt-6 mt-8">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dedicated agency database partition</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Full role-based agent permissions</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                Agency Registration
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your details to create your brokerage organization.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Your Full Name"
                  required
                  placeholder="e.g. Vikram Singhania"
                  icon={<User className="w-4 h-4" />}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <Input
                  label="Agency / Brokerage Name"
                  required
                  placeholder="e.g. PrimeSpace Realty"
                  icon={<Building className="w-4 h-4" />}
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Work Email Address"
                  type="email"
                  required
                  placeholder="director@agency.com"
                  icon={<Mail className="w-4 h-4" />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Mobile Contact"
                  type="tel"
                  required
                  placeholder="9876543210"
                  icon={<Phone className="w-4 h-4" />}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <Input
                  label="Create Password"
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  icon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  icon={<Lock className="w-4 h-4" />}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                size="md"
                loading={loading}
                className="mt-3 w-full font-semibold shadow-md shadow-indigo-600/20"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Register &amp; Create Agency Workspace
              </Button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Already have an agency account?</span>
            <button
              type="button"
              onClick={onGoToLogin}
              className="font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer inline-flex items-center gap-1"
            >
              Sign In Instead <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
