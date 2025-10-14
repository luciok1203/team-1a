// LoginPage.tsx

import axios, { AxiosError } from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LoginPage.css';

const API_BASE = 'https://api-internhasha.wafflestudio.com';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const { setToken } = useAuth();

  async function handleLogin() {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/user/session`, {
        email: formData.email + '@snu.ac.kr',
        password: formData.password,
      });
      setToken(res.data.token);
      localStorage.setItem('authToken', res.data.token);
    } catch (error) {
      const err = error as AxiosError;
      console.error(err.response?.data);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo">스누인턴</div>
        <nav className="nav">
          <Link to="/signup">회원가입</Link>
          <Link to="/login">로그인</Link>
        </nav>
      </header>

      {/* Login Form */}
      <main className="form-section">
        <h1>로그인</h1>

        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            이메일
            <div className="email-field">
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <span>@snu.ac.kr</span>
            </div>
          </label>

          <label>
            비밀번호
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          <div className="signup-link">
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" className="highlight">
              회원가입
            </Link>
          </div>

          <button type="submit" className="submit-btn">
            로그인
          </button>
        </form>
      </main>
    </div>
  );
};

export default LoginPage;
