import { useMutation } from '@tanstack/react-query';
import api from '../api/client';
import { useAuthStore } from '../stores/authStore';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: LoginRequest) =>
      api.post<AuthResponse>('/auth/login', data).then((r) => r.data),
    onSuccess: (data) => setAuth(data),
  });
}

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: (data: RegisterRequest) =>
      api.post<AuthResponse>('/auth/register', data).then((r) => r.data),
    onSuccess: (data) => setAuth(data),
  });
}
