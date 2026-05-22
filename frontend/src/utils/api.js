import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // No response → network / timeout error
    if (!error.response) {
      const msg = error.code === 'ECONNABORTED'
        ? 'Request timed out. Please try again.'
        : 'Network error. Please check your connection and try again.';
      return Promise.reject({ ...error, response: { data: { message: msg } } });
    }

    const { status, config } = error.response;

    // 401 on a real data request (not the auth/me session check) → session expired
    const url = config?.url || '';
    const isSessionCheck = url.includes('/auth/me');
    if (status === 401 && !isSessionCheck) {
      const path = window.location.pathname;
      const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/verify-otp', '/reset-password'];
      if (!AUTH_PATHS.some((p) => path.startsWith(p))) {
        window.location.href = '/login';
      }
    }

    // 429 → friendly rate-limit message
    if (status === 429 && !error.response.data?.message) {
      error.response.data = {
        message: 'Too many requests. Please wait a moment and try again.',
      };
    }

    // 500 → generic server error message
    if (status >= 500 && !error.response.data?.message) {
      error.response.data = {
        message: 'Something went wrong on our end. Please try again shortly.',
      };
    }

    return Promise.reject(error);
  }
);

export default api;
