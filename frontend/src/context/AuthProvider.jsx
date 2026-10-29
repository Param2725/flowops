import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from './authContext.js';
import { controlApi } from '../lib/api.js';
import { session } from '../lib/session.js';

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (session.getRefreshToken() ? 'loading' : 'anonymous'));
  const refreshInFlight = useRef(null);

  const clearSession = useCallback(() => {
    session.setAccessToken(null);
    session.clearRefreshToken();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const applySession = useCallback(({ accessToken, refreshToken, user: nextUser }) => {
    session.setAccessToken(accessToken);
    session.setRefreshToken(refreshToken);
    setUser(nextUser);
    setStatus('authenticated');
  }, []);

  const refresh = useCallback(() => {
    if (refreshInFlight.current) return refreshInFlight.current;
    const refreshToken = session.getRefreshToken();
    if (!refreshToken) return Promise.resolve(false);

    refreshInFlight.current = controlApi
      .post('/api/auth/refresh', { refreshToken }, { skipAuthRetry: true })
      .then((data) => {
        session.setAccessToken(data.accessToken);
        if (data.refreshToken) session.setRefreshToken(data.refreshToken);
        return true;
      })
      .catch((err) => {
        if (err.status >= 400 && err.status < 500) clearSession();
        return false;
      })
      .finally(() => {
        refreshInFlight.current = null;
      });

    return refreshInFlight.current;
  }, [clearSession]);

  useEffect(() => {
    session.setRefreshHandler(refresh);
    if (!session.getRefreshToken()) return undefined;

    let active = true;
    const restore = async () => {
      if (!(await refresh())) {
        if (active) setStatus('anonymous');
        return;
      }
      try {
        const me = await controlApi.get('/api/users/me');
        if (active) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        if (active) setStatus('anonymous');
      }
    };
    restore();
    return () => {
      active = false;
    };
  }, [refresh]);

  const login = useCallback(
    async (email, password) => {
      const data = await controlApi.post(
        '/api/auth/login',
        { email, password },
        { skipAuthRetry: true },
      );
      applySession(data);
      return data.user;
    },
    [applySession],
  );

  const register = useCallback(
    async (details) => {
      const data = await controlApi.post('/api/auth/register', details, { skipAuthRetry: true });
      applySession(data);
      return data.user;
    },
    [applySession],
  );

  const value = useMemo(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      login,
      register,
      logout: clearSession,
    }),
    [user, status, login, register, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
