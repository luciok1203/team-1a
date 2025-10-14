import axios from 'axios';
import React, { useState } from 'react';

import './SignupPage.css';

const SignupPage = () => {
  const API_BASE = 'https://api-internhasha.wafflestudio.com';

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
      console.log('성공', res.data.token);
    } catch (error) {
      console.error('실패', error);
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
  });

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
          <a href="#">회원가입</a>
          <a href="#">로그인</a>
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

          <label>
            비밀번호 확인
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </label>

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
