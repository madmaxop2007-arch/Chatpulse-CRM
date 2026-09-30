import React, { useState } from 'react';
import { Building, Mail, CheckCircle2, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onBackToLogin }) => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSubmitted(true);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-10 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-slate-800/20">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
            <Building className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight font-display">ChatPulse CRM</h1>
          <p className="text-xs text-slate-500 mt-0.5">Password Recovery</p>
        </div>

        {submitted ? (
          <div className="text-center py-2">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">Check Your Email</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              We sent password reset instructions to <strong className="text-slate-800 font-semibold">{email}</strong>. Check your inbox and spam folder.
            </p>
            <Button
              variant="outline"
              size="md"
              onClick={onBackToLogin}
              className="mt-6 w-full"
              icon={<ArrowLeft className="w-4 h-4" />}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Forgot Password</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered work email and we will send you a reset link.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Registered Work Email"
                type="email"
                required
                placeholder="broker@agency.com"
                icon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" size="md" loading={loading} className="mt-2 w-full font-semibold shadow-md shadow-indigo-600/20">
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={onBackToLogin}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
