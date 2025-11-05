// HomePage.tsx

import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { encodeQueryParams } from './EncodeQueryParams';
import './HomePage.css';

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

  const [posts, setPosts] = useState();

  interface Params {
    [key: string]: string[] | boolean | number;
    positions: string[];
    domains: string[];
    isActive: boolean;
    order: number;
  }

  const [params, setParams] = useState<Params>({
    positions: [],
    domains: [],
    isActive: false,
    order: 0,
  });

  useEffect(() => {
    const getPosts = async () => {
      try {
        const queryString = encodeQueryParams({ params });
        const res = await axios.get(`${API_BASE}/api/post?${queryString}`);
        console.log(res.data);
      } catch (error) {
        const err = error as AxiosError;
        console.error(err.response?.data);
      }
    };
    getPosts();
  }, [params]);

  return (
    <div className="container">
      {/* Header */}
      <header className="header">
        <div className="logo">스누인턴</div>
        <nav className="nav">
          {name ? <span>{name}님</span> : <Link to="/signup">회원가입</Link>}
          {name ? (
            <a onClick={logout}>로그아웃</a>
          ) : (
            <Link to="/login">로그인</Link>
          )}
        </nav>
      </header>

      <main>{name ? <h1>{name}님 환영합니다.</h1> : null}</main>
    </div>
  );
};

export default LoginPage;
