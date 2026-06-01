import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import api from '../api/client';

export default function RegisterPage() {
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [timer, setTimer] = useState(0);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    navigate('/', { replace: true });
  }

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/auth/register/send-otp', { email });
      toast.success('OTP sent to your email');
      setStep('otp');
      setTimer(300);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const res = await api.post('/auth/register/verify', {
        email,
        otp,
        password,
        fullName,
      });
      setAuth(res.data);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
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
            {step === 'form' ? 'Create your account' : 'Verify your email'}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
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
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded-lg text-sm text-center">
              A 6-digit code was sent to <strong>{email}</strong>
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

            <div className="text-center text-sm text-gray-500">
              {timer > 0 ? (
                <span>Code expires in <strong className="text-gray-700">{formatTime(timer)}</strong></span>
              ) : (
                <span className="text-red-500">Code expired — please request a new one</span>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={verifying || otp.length !== 6 || timer === 0}
            >
              {verifying ? 'Verifying...' : 'Verify & Register'}
            </button>

            <button
              type="button"
              onClick={(e) => {
                setStep('form');
                setOtp('');
              }}
              className="w-full text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Back
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
