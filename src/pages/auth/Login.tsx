import React, { useState } from 'react';
import { Building, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface LoginProps {
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
}

export const Login: React.FC<LoginProps> = ({ onGoToRegister, onGoToForgotPassword }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide your registered email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please verify and try again.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again in a few minutes or reset your password.');
      } else {
        setError(err.message || 'Failed to sign in. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = () => {
    setEmail('madmaxop2007@gmail.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-indigo-500 selection:text-white">
      {/* Container Frame */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800/20">
        
        {/* Left Side: Real Estate Architectural Showcase Panel */}
        <div className="lg:col-span-6 bg-[#0B0F19] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Mark */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
                <Building className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight font-display text-white">ChatPulse CRM</span>
                <span className="text-[10px] text-indigo-400 block font-semibold uppercase tracking-widest">
                  Real Estate OS
                </span>
              </div>
            </div>

            {/* Architectural Statement */}
            <div className="mt-12 sm:mt-16">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 text-xs font-semibold border border-indigo-500/20 mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Next-Gen Brokerage Platform
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight font-display">
                The Operating System for High-Velocity Real Estate Teams.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                Seamlessly manage multi-crore property inventory, prospective buyers, site visit itineraries, and pipeline deals in one unified dashboard.
              </p>
            </div>
          </div>

          {/* Middle Proof Stats */}
          <div className="relative z-10 grid grid-cols-2 gap-4 my-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
            <div>
              <span className="text-xl sm:text-2xl font-bold text-white font-mono tabular-nums">₹580Cr+</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Inventory Managed</p>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono tabular-nums">42%</span>
              <p className="text-[11px] text-slate-400 mt-0.5">Faster Deal Velocity</p>
            </div>
          </div>

          {/* Bottom Security / Trust */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Isolated Multi-Tenant Security
            </span>
            <span className="text-[11px] text-slate-300">Firebase Firestore</span>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight font-display">
                Sign In to Your Agency
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your credentials to access your leads pipeline and properties.
              </p>
            </div>

            {/* Quick Demo Credentials shortcut */}
            <div className="mb-5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between gap-2">
              <div className="text-xs text-indigo-950">
                <span className="font-semibold block">Registered User:</span>
                <span className="text-[11px] text-indigo-700 font-mono">madmaxop2007@gmail.com</span>
              </div>
              <button
                type="button"
                onClick={fillQuickDemo}
                className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-100 rounded-md border border-indigo-200 shadow-2xs transition cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Work Email Address"
                type="email"
                required
                placeholder="broker@agency.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Account Password</label>
                  <button
                    type="button"
                    onClick={onGoToForgotPassword}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  icon={<Lock className="w-4 h-4" />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                size="md"
                loading={loading}
                className="mt-2 w-full font-semibold shadow-md shadow-indigo-600/20"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Workspace
              </Button>
            </form>
          </div>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Need a new agency workspace?</span>
            <button
              type="button"
              onClick={onGoToRegister}
              className="font-bold text-indigo-600 hover:text-indigo-700 transition cursor-pointer inline-flex items-center gap-1"
            >
              Create Agency Account <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
