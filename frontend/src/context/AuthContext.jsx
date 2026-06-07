import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { registerTokenGetter } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider - manages state and API calls for authentication.
 * Stores accessToken in-memory, cookie stores refresh token.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep access token synced with the Axios instance interceptor
  useEffect(() => {
    registerTokenGetter(() => accessToken);
  }, [accessToken]);

  // Fetch complete user profile data using access token
  const fetchUserProfile = useCallback(async (token) => {
    try {
      registerTokenGetter(() => token);
      const { data } = await userService.getMe();
      setUser(data);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      setUser(null);
      setAccessToken(null);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const { data } = await authService.login({ email, password });
      setAccessToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (displayName, email, password) => {
    setIsLoading(true);
    try {
      const { data } = await authService.register({
        display_name: displayName,
        email,
        password,
      });
      setAccessToken(data.access_token);
      setUser(data.user);
      return data.user;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
      setAccessToken(null);
      setIsLoading(false);
    }
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  // Silent token refresh on mount (checks if refresh token cookie is valid)
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const { data } = await authService.refresh();
        if (isMounted) {
          setAccessToken(data.access_token);
          await fetchUserProfile(data.access_token);
        }
      } catch (err) {
        console.log('No active session found on mount.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    initAuth();
    return () => {
      isMounted = false;
    };
  }, [fetchUserProfile]);

  // Listen for background Axios interceptor token refresh events
  useEffect(() => {
    const handleTokenRefreshed = async (e) => {
      const token = e.detail.token;
      setAccessToken(token);
      await fetchUserProfile(token);
    };

    const handleAuthLogout = () => {
      setUser(null);
      setAccessToken(null);
    };

    window.addEventListener('token:refreshed', handleTokenRefreshed);
    window.addEventListener('auth:logout', handleAuthLogout);

    return () => {
      window.removeEventListener('token:refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [fetchUserProfile]);

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
