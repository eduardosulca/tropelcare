import { useState, useEffect } from 'react';
import type { User } from '../types/api';
import { login as apiLogin, getMe } from '../api/endpoints';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(teamCode: string, email: string, password: string) {
    const res = await apiLogin(teamCode, email, password);
    localStorage.setItem('token', res.token);
    setUser(res.user);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return { user, loading, login, logout };
}