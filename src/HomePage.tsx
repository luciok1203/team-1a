// LoginPage.tsx

import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LoginPage.css';

const API_BASE = 'https://api-internhasha.wafflestudio.com';

const LoginPage = () => {
  const [name, setName] = useState(null);

  const { token, logout } = useAuth();

  useEffect(() => {
    const checkToken = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setName(res.data.name);
        } catch (error) {
          const err = error as AxiosError;
          console.error(err.response?.data);
        }
      } else {
        setName(null);
      }
    };

    checkToken();
  }, [token]);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo">스누인턴</div>
        <nav className="nav">
          {name ? <div>{name}님</div> : <Link to="/signup">회원가입</Link>}
          {name ? (
            <div onClick={logout}>로그아웃</div>
          ) : (
            <Link to="/login">로그인</Link>
          )}
        </nav>
      </header>

      <main>
        <h1></h1>
      </main>
    </div>
  );
};

export default LoginPage;
