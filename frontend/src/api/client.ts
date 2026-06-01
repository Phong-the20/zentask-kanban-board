import axios from 'axios';

const AUTH_KEY = 'zentask-auth';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.token || null;
  } catch {
    return null;
  }
}

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem(AUTH_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { getToken };
export default api;
