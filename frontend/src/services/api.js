import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Configured Axios instance for the Premium Calculator API.
 *
 * Features:
 * - Base URL from environment variable
 * - JSON content type by default
 * - Credentials included (for httpOnly refresh token cookie)
 * - Request interceptor: attaches Bearer access token from auth context
 * - Response interceptor: handles 401 → silent token refresh (Phase 2)
 */
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Required for httpOnly refresh token cookie
  timeout: 15000,
});

// ── Request Interceptor ──────────────────────────────────────────────────────

let _getAccessToken = null;

/**
 * Register a function that returns the current access token.
 * Called from AuthContext once it initializes.
 */
export function registerTokenGetter(fn) {
  _getAccessToken = fn;
}

api.interceptors.request.use(
  (config) => {
    const token = _getAccessToken?.();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────

let _isRefreshing = false;
let _failedQueue = [];

function processQueue(error, token = null) {
  _failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  _failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 — attempt silent token refresh (implemented in Phase 2)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (_isRefreshing) {
        return new Promise((resolve, reject) => {
          _failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      _isRefreshing = true;

      try {
        // Phase 2: POST /auth/refresh → get new access token
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.access_token;

        // Update the token in the queue and retry
        processQueue(null, newToken);
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Notify AuthContext to update token (Phase 2 will wire this)
        window.dispatchEvent(new CustomEvent('token:refreshed', { detail: { token: newToken } }));

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Token refresh failed — force logout
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        _isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
