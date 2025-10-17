// SignupPage.tsx

import axios, { AxiosError } from 'axios';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PasswordInput from './PasswordInput';
import './SignupPage.css';

const API_BASE = 'https://api-internhasha.wafflestudio.com';

const SignupPage = () => {
  const { setToken } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
  });

  const navigate = useNavigate();

  async function handleSignUp() {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/user`, {
        authType: 'APPLICANT',
        info: {
          type: 'APPLICANT',
          name: formData.name,
          email: formData.email + '@snu.ac.kr',
          password: formData.password,
          successCode: '1234',
        },
      });
      setToken(res.data.token);
      localStorage.setItem('authToken', res.data.token);
      navigate('/');
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
    if (formData.password !== formData.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    handleSignUp();
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

      {/* Form */}
      <main className="form-section">
        <h1>회원가입</h1>
        <form className="signup-form" onSubmit={handleSubmit}>
          <label>
            이름
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <PasswordInput
            label="비밀번호"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <PasswordInput
            label="비밀번호 확인"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

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

          <button type="submit" className="submit-btn">
            회원가입
          </button>
        </form>
      </main>
    </div>
  );
};

export default SignupPage;
