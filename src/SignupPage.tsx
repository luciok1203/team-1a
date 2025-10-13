import React, { useState } from 'react';
import './SignupPage.css';

const SignupPage: React.FC = () => {
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
    alert('회원가입이 완료되었습니다!');
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
