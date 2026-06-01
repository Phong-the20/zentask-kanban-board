import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import api from '../api/client';
import type { AcceptInviteResponse } from '../types';

export default function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const token = searchParams.get('token');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [state, setState] = useState<'loading' | 'success' | 'error'>('loading');
  const [response, setResponse] = useState<AcceptInviteResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    if (!token) {
      setState('error');
      setErrorMsg('No invitation token found in the URL.');
      return;
    }

    if (!isAuthenticated) {
      setState('error');
      setErrorMsg('auth_required');
      return;
    }

    api
      .post<AcceptInviteResponse>('/workspaces/accept-invite', { token })
      .then((res) => {
        setResponse(res.data);
        setState('success');
      })
      .catch((err) => {
        setState('error');
        setErrorMsg(
          err.response?.data?.message || 'Failed to accept invitation. The link may be invalid or expired.'
        );
      });
  }, [token, isAuthenticated]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h1>
          <p className="text-gray-500 mb-6">No invitation token found in the URL.</p>
          <Link to="/" className="btn-primary inline-block">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = `/workspace/accept-invite?token=${token}`;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-500 mb-6">
            Please sign in to accept the workspace invitation.
          </p>
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="btn-primary inline-block"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-500">Accepting invitation...</p>
        </div>
      </div>
    );
  }

  if (state === 'success' && response) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Successfully Joined!
          </h1>
          <p className="text-gray-500 mb-6">{response.message}</p>
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['workspace-members', response.workspaceId] });
              navigate(`/workspace/${response.workspaceId}`);
            }}
            className="btn-primary inline-block"
          >
            Go to Workspace
          </button>
        </div>
      </div>
    );
  }

  const isAuthError = errorMsg === 'auth_required';
  const redirectPath = isAuthError ? `/workspace/accept-invite?token=${token}` : null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">❌</div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invitation Failed</h1>
        <p className="text-gray-500 mb-6">{isAuthError ? 'Please sign in first.' : errorMsg}</p>
        {redirectPath ? (
          <Link
            to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            className="btn-primary inline-block"
          >
            Sign In
          </Link>
        ) : (
          <Link to="/" className="btn-primary inline-block">Go to Dashboard</Link>
        )}
      </div>
    </div>
  );
}
