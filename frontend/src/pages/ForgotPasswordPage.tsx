import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/client';

type Step = 'email' | 'otp' | 'success';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/auth/password-reset/send-otp', { email });
      toast.success('OTP sent to your email');
      setStep('otp');
      setTimer(300);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setResetting(true);
    try {
      await api.post('/auth/password-reset/confirm', {
        email,
        otp,
        newPassword,
      });
      toast.success('Password reset successful!');
      setStep('success');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setResetting(false);
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ZenTask</h1>
          <p className="text-gray-500 mt-1">
            {step === 'email'
              ? 'Reset your password'
              : step === 'otp'
              ? 'Enter new password'
              : 'All done!'}
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={sending}
            >
              {sending ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 'otp' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm text-center">
              A reset code was sent to <strong>{email}</strong>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP Code
              </label>
              <input
                type="text"
                className="input-field text-center text-2xl tracking-[8px] font-mono"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="Repeat new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div className="text-center text-sm text-gray-500">
              {timer > 0 ? (
                <span>Code expires in <strong className="text-gray-700">{formatTime(timer)}</strong></span>
              ) : (
                <span className="text-red-500">Code expired</span>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={resetting || otp.length !== 6 || timer === 0}
            >
              {resetting ? 'Resetting...' : 'Reset Password'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Back
            </button>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600">
              Your password has been reset successfully.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full"
            >
              Sign In
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Remember your password?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
