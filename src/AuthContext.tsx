// AuthContext.tsx

import axios, { AxiosError } from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';

const API_BASE = 'https://api-internhasha.wafflestudio.com';

const AuthContext = createContext<{
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
}>({
  token: null,
  setToken: () => undefined,
  logout: () => undefined,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);

  // ✅ 앱 시작 시 토큰 검증
  useEffect(() => {
    const checkToken = async () => {
      const saved = localStorage.getItem('authToken');
      if (!saved) return;

      try {
        // 🔹 서버에 /api/auth/me 요청으로 토큰 유효성 확인
        await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${saved}` },
        });
        // ✅ 유효하면 전역 상태에 반영
        setToken(saved);
      } catch (error) {
        const err = error as AxiosError;
        console.error(err.response?.data || err.message);
        localStorage.removeItem('authToken');
        setToken(null);
      }
    };

    checkToken();
  }, []);

  // ✅ 로그아웃 함수 (토큰 초기화)
  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ 어디서든 useAuth()로 토큰 상태/설정/로그아웃 접근 가능
export const useAuth = () => useContext(AuthContext);
