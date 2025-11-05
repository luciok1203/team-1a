// HomePage.tsx

import axios, { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { encodeQueryParams } from './EncodeQueryParams';
import './HomePage.css';

const API_BASE = 'https://api-internhasha.wafflestudio.com';

const ROLES_OPTIONS = {
  개발: ['FRONT', 'APP', 'BACKEND', 'DATA', 'OTHERS'],
  디자인: ['DESIGN'],
  기획: ['PLANNER'],
  마케팅: ['MARKETING'],
};

const DOMAIN_OPTIONS = [
  'FINTECH',
  'HEALTHTECH',
  'EDUCATION',
  'ECOMMERCE',
  'FOODTECH',
  'MOBILITY',
  'CONTENTS',
  'B2B',
  'OTHERS',
];

const ORDER_OPTIONS = [
  { value: 0, label: '최신순' },
  { value: 1, label: '조회수순' },
  { value: 2, label: '마감임박순' },
];

const HomePage = () => {
  const { token, logout } = useAuth();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      if (!token) return setName(null);
      try {
        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(res.data.name);
      } catch (error) {
        const err = error as AxiosError;
        console.error(err.response?.data);
      }
    };
    checkToken();
  }, [token]);

  const [posts, setPosts] = useState<any[]>([]);

  interface Params {
    [key: string]: string[] | boolean | number;
    roles: string[];
    domains: string[];
    isActive: boolean;
    order: number;
  }

  const [params, setParams] = useState<Params>({
    roles: [],
    domains: [],
    isActive: false,
    order: 0,
  });

  useEffect(() => {
    const getPosts = async () => {
      try {
        const query = encodeQueryParams({ params });
        const res = await axios.get(`${API_BASE}/api/post?${query}`);
        setPosts(res.data.posts);
      } catch (error) {
        const err = error as AxiosError;
        console.error(err.response?.data);
      }
    };
    getPosts();
  }, [params]);

  const toggleRole = (value: string) => {
    setParams((prev) => ({
      ...prev,
      roles: prev.roles.includes(value)
        ? prev.roles.filter((v) => v !== value)
        : [...prev.roles, value],
    }));
  };

  const toggleDomain = (value: string) => {
    setParams((prev) => ({
      ...prev,
      domains: prev.domains.includes(value)
        ? prev.domains.filter((v) => v !== value)
        : [...prev.domains, value],
    }));
  };

  const toggleActive = () => {
    setParams((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  const changeOrder = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((prev) => ({
      ...prev,
      order: Number(e.target.value),
    }));
  };

  return (
    <div className="container">
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

      <main className="main-layout">
        <aside className="sidebar">
          <h3>직무</h3>
          {Object.entries(ROLES_OPTIONS).map(([category, values]) => (
            <div key={category}>
              <div className="filter-category">{category}</div>
              {values.map((v) => (
                <label key={v} className="filter-item">
                  <input
                    type="checkbox"
                    checked={params.roles.includes(v)}
                    onChange={() => toggleRole(v)}
                  />
                  {v}
                </label>
              ))}
            </div>
          ))}

          <h3>도메인</h3>
          {DOMAIN_OPTIONS.map((d) => (
            <label key={d} className="filter-item">
              <input
                type="checkbox"
                checked={params.domains.includes(d)}
                onChange={() => toggleDomain(d)}
              />
              {d}
            </label>
          ))}

          <h3>모집 상태</h3>
          <label className="filter-item">
            <input
              type="checkbox"
              checked={params.isActive}
              onChange={toggleActive}
            />
            모집중만 보기
          </label>

          <h3>정렬</h3>
          <select
            value={params.order}
            onChange={changeOrder}
            className="filter-select"
          >
            {ORDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </aside>

        <section className="posts-section">
          {posts.length === 0 ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            posts.map((post) => {
              const isClosed = new Date(post.employmentEndDate) < new Date();
              return (
                <div key={post.id} className="post-card">
                  <div className="post-card-header">
                    <h4>{post.positionTitle}</h4>
                    <span className="badge">
                      {isClosed ? '마감' : '모집 중'}
                    </span>
                  </div>

                  <div className="company">{post.companyName}</div>

                  <div className="info">
                    {post.positionType} 개발 {post.headCount}명
                  </div>

                  <p className="summary">{post.detailSummary}</p>

                  <div className="tags">
                    <span>{post.location}</span>
                    {post.tags?.map((t: any) => (
                      <span key={t.tag}>{t.tag}</span>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
