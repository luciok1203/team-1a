// HomePage.tsx

import axios, { AxiosError } from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { encodeQueryParams } from './EncodeQueryParams';
import './HomePage.css';
import Pagination from './Pagination'; // 1. Import the new component

const API_BASE = 'https://api-internhasha.wafflestudio.com';

// ... (Filter options and other constants remain the same) ...
const ROLES_OPTIONS = {
  개발: {
    '프론트엔드 개발': 'FRONT',
    '앱 개발': 'APP',
    '서버·백엔드 개발': 'BACKEND',
    '데이터 분석': 'DATA',
    기타: 'OTHERS',
  },
  디자인: { 디자인: 'DESIGN' },
  기획: { 기획: 'PLANNER' },
  마케팅: { 마케팅: 'MARKETING' },
};
const DOMAIN_LABELS: { [key: string]: string } = {
  FINTECH: '핀테크',
  HEALTHTECH: '헬스테크',
  EDUCATION: '교육',
  ECOMMERCE: '이커머스',
  FOODTECH: '푸드테크',
  MOBILITY: '모빌리티',
  CONTENTS: '컨텐츠',
  B2B: 'B2B',
  OTHERS: '기타',
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
const ORDER_LABELS: { [key: number]: string } = {
  0: '공고등록순',
  1: '마감임박순',
};
const ORDER_VALUES = [0, 1];
interface Params {
  [key: string]: string[] | boolean | number;
  roles: string[];
  domains: string[];
  isActive: boolean;
  order: number;
  page: number;
}
const INITIAL_PARAMS: Params = {
  roles: [],
  domains: [],
  isActive: false,
  order: 0,
  page: 1,
};

interface Post {
  id: string;
  companyName: string;
  employmentEndDate: string;
  positionTitle: string;
  domain: string;
  slogan: string;
  headCount: number;
  isBookmarked: boolean;
  positionType: string;
  detailSummary: string;
}

// ... (useOutsideClick hook remains the same) ...
const useOutsideClick = <T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  callback: () => void
) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [ref, callback]);
};

// ... (LoginModal component remains the same) ...
interface LoginModalProps {
  onClose: () => void;
  onNavigate: () => void;
}
const LoginModal: React.FC<LoginModalProps> = ({ onClose, onNavigate }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>찜하기를 하려면 로그인이 필요해요</h3>
        <p>계정이 없으시다면</p>
        <p>지금 바로 회원가입해보세요</p>
        <button className="modal-btn-login" onClick={onNavigate}>
          로그인하기
        </button>
        <button className="modal-btn-cancel" onClick={onClose}>
          뒤로 가기
        </button>
      </div>
    </div>
  );
};

// --- HomePage Component ---
const HomePage = () => {
  const { token, logout } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // ... (checkToken logic remains the same) ...
    const checkToken = async () => {
      if (!token) {
        setName(null);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(res.data.name);
      } catch (error) {
        const err = error as AxiosError;
        console.error(err.response?.data);
        logout();
      }
    };
    checkToken();
  }, [token, logout]);

  const [posts, setPosts] = useState<Post[]>([]);
  const [params, setParams] = useState<Params>(INITIAL_PARAMS);
  const [localParams, setLocalParams] = useState<Params>(INITIAL_PARAMS);
  const [openFilter, setOpenFilter] = useState<string | null>(null);

  // 2. Add new state for pagination
  const [totalPages, setTotalPages] = useState(1);

  const rolesFilterRef = useRef<HTMLDivElement>(null);
  const otherFiltersRef = useRef<HTMLDivElement>(null);

  useOutsideClick(rolesFilterRef, () => {
    if (openFilter === 'roles') setOpenFilter(null);
  });

  useOutsideClick(otherFiltersRef, () => {
    if (openFilter !== 'roles' && openFilter !== null) setOpenFilter(null);
  });

  // 4. Update useEffect to depend on currentPage and send it
  useEffect(() => {
    const getPosts = async () => {
      try {
        const apiParams = { ...params, page: params.page - 1 };
        const query = encodeQueryParams({ params: apiParams });

        // 여기만 바꿈: 토큰이 있으면 Authorization 헤더 포함
        const res = await axios.get(`${API_BASE}/api/post?${query}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        // console.log(res.data);
        setPosts(res.data.posts);
        setTotalPages(res.data.paginator.lastPage);

        // (선택) 서버가 isBookmarked 내려주면 현재 페이지 기준으로 동기화하고 싶을 때만 사용
        // setBookmarkedIds(new Set<string>(
        //   (res.data.posts || []).filter((p: any) => p.isBookmarked).map((p: any) => p.id)
        // ));
      } catch (error) {
        const err = error as AxiosError;
        console.error(err.response?.data);
      }
    };
    getPosts();
  }, [params, token]); // token을 의존성에 추가(헤더 반영 위해)

  const toggleFilter = (filterName: string) => {
    if (openFilter === filterName) {
      setOpenFilter(null); // 같은 버튼 누르면 닫힘
      return;
    }

    // roles는 params 그대로 사용 (localParams 사용 안 함)
    if (filterName !== 'roles') {
      setLocalParams(params);
    }

    setOpenFilter(filterName);
  };

  // 3. Reset page to 1 when filters change
  const toggleRoleDirectly = (value: string) => {
    setParams((prev) => ({
      ...prev,
      roles: prev.roles.includes(value)
        ? prev.roles.filter((v) => v !== value)
        : [...prev.roles, value],
    }));
    setPage(1); // Reset page
  };

  const toggleSelectAllRolesInGroup = (roleValues: string[]) => {
    const hasAllSelected = roleValues.every((v) => params.roles.includes(v));

    if (hasAllSelected) {
      // 전체 해제
      setParams((prev) => ({
        ...prev,
        roles: prev.roles.filter((role) => !roleValues.includes(role)),
      }));
    } else {
      // 전체 선택
      setParams((prev) => ({
        ...prev,
        roles: Array.from(new Set([...prev.roles, ...roleValues])),
      }));
    }

    setPage(1);
  };

  const setPage = (page: number) => {
    setParams((prev) => ({
      ...prev,
      page,
    }));
  };

  // ... (toggleLocalDomain, setLocalStatus, setLocalOrder remain the same) ...
  const toggleLocalDomain = (value: string) => {
    setLocalParams((prev) => ({
      ...prev,
      domains: prev.domains.includes(value)
        ? prev.domains.filter((v) => v !== value)
        : [...prev.domains, value],
    }));
  };
  const setLocalStatus = (isActive: boolean) => {
    setLocalParams((prev) => ({
      ...prev,
      isActive,
    }));
  };
  const setLocalOrder = (order: number) => {
    setLocalParams((prev) => ({
      ...prev,
      order,
    }));
  };

  // 3. Reset page to 1 when filters change
  const handleApply = () => {
    setParams(localParams);
    setOpenFilter(null);
    setPage(1); // Reset page
  };

  // ... (handleLocalReset remains the same) ...
  const handleLocalReset = (filterName: string) => {
    switch (filterName) {
      case 'status':
        setLocalParams((prev) => ({
          ...prev,
          isActive: INITIAL_PARAMS.isActive,
        }));
        break;
      case 'domains':
        setLocalParams((prev) => ({
          ...prev,
          domains: INITIAL_PARAMS.domains,
        }));
        break;
      case 'order':
        setLocalParams((prev) => ({ ...prev, order: INITIAL_PARAMS.order }));
        break;
    }
  };

  // 3. Reset page to 1 when filters change
  const resetAllFilters = () => {
    setParams(INITIAL_PARAMS);
    setLocalParams(INITIAL_PARAMS);
    setOpenFilter(null);
    setPage(1); // Reset page
  };

  const getOrderButtonLabel = () => {
    if (params.order === 0) return '최신순';
    if (params.order === 1) return '마감임박순';
    return '최신순';
  };

  // ... (Bookmark logic remains the same) ...
  const handleBookmarkToggle = async (post: Post) => {
    const url = `${API_BASE}/api/post/${post.id}/bookmark`;

    // Optimistic UI 업데이트
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );

    try {
      if (post.isBookmarked) {
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(
          url,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      console.error('Failed to update bookmark', error);

      // 실패 시 UI 롤백
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, isBookmarked: post.isBookmarked } : p
        )
      );
    }
  };

  const handleBookmarkClick = (post: Post) => {
    if (!token) {
      setShowLoginModal(true);
    } else {
      handleBookmarkToggle(post);
    }
  };

  return (
    <div className="container">
      {/* --- Render Modal --- */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onNavigate={() => {
            setShowLoginModal(false);
            navigate('/login');
          }}
        />
      )}

      {/* ... (Header remains the same) ... */}
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
        {/* --- Filters Container --- */}
        <div className="filters-container">
          {/* ... (All your filters remain the same) ... */}
          {/* 1. 직군 필터 (Large Button) */}
          <div
            className="filter-dropdown filter-dropdown-roles"
            ref={rolesFilterRef}
          >
            <button
              className={`filter-btn-roles ${openFilter === 'roles' ? 'active' : ''}`}
              onClick={() => toggleFilter('roles')}
            >
              <span>직군 필터</span>
              <span
                className={`filter-arrow ${openFilter === 'roles' ? 'open' : ''}`}
              >
                ▼
              </span>
            </button>

            <div
              className={`roles-dropdown-wrapper ${openFilter === 'roles' ? 'open' : ''}`}
            >
              <div className="dropdown-content">
                {Object.entries(ROLES_OPTIONS).map(([group, roles]) => {
                  const roleEntries = Object.entries(roles);
                  const roleValues = roleEntries.map(([_, value]) => value);
                  const allSelected = roleValues.every((v) =>
                    params.roles.includes(v)
                  );

                  return (
                    <div key={group} className="filter-group">
                      <h4>{group}</h4>

                      {/* ✅ 전체 선택 추가 */}
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() =>
                            toggleSelectAllRolesInGroup(roleValues)
                          }
                        />
                        전체 선택
                      </label>

                      {/* 기존 체크박스들 */}
                      {roleEntries.map(([key, value]) => (
                        <label key={value} className="checkbox-option">
                          <input
                            type="checkbox"
                            checked={params.roles.includes(value)}
                            onChange={() => toggleRoleDirectly(value)}
                          />
                          {key}
                        </label>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Secondary Filter Bar (Status, Domain, Order, Reset) */}
          <div className="filter-bar" ref={otherFiltersRef}>
            {/* 모집상태 Dropdown */}
            <div className="filter-dropdown">
              <button
                className={`filter-btn ${openFilter === 'status' ? 'active' : ''}`}
                onClick={() => toggleFilter('status')}
              >
                모집상태 ▼
              </button>
              {openFilter === 'status' && (
                <div className="dropdown-menu">
                  <div className="dropdown-content">
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="status"
                        checked={!localParams.isActive}
                        onChange={() => setLocalStatus(false)}
                      />
                      전체
                    </label>
                    <label className="radio-option">
                      <input
                        type="radio"
                        name="status"
                        checked={localParams.isActive}
                        onChange={() => setLocalStatus(true)}
                      />
                      모집중
                    </label>
                  </div>
                  <div className="dropdown-footer">
                    <button
                      className="btn-reset"
                      onClick={() => handleLocalReset('status')}
                    >
                      초기화
                    </button>
                    <button className="btn-apply" onClick={handleApply}>
                      적용
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 업종 Dropdown */}
            <div className="filter-dropdown">
              <button
                className={`filter-btn ${openFilter === 'domains' ? 'active' : ''}`}
                onClick={() => toggleFilter('domains')}
              >
                업종 ▼
              </button>
              {openFilter === 'domains' && (
                <div className="dropdown-menu">
                  <div className="dropdown-content">
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={localParams.domains.length === 0}
                        onChange={() => handleLocalReset('domains')}
                      />
                      전체
                    </label>
                    {DOMAIN_OPTIONS.map((domain) => (
                      <label key={domain} className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={localParams.domains.includes(domain)}
                          onChange={() => toggleLocalDomain(domain)}
                        />
                        {DOMAIN_LABELS[domain] || domain}
                      </label>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <button
                      className="btn-reset"
                      onClick={() => handleLocalReset('domains')}
                    >
                      초기화
                    </button>
                    <button className="btn-apply" onClick={handleApply}>
                      적용
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 정렬 Dropdown */}
            <div className="filter-dropdown">
              <button
                className={`filter-btn ${openFilter === 'order' ? 'active' : ''}`}
                onClick={() => toggleFilter('order')}
              >
                {getOrderButtonLabel()} ▼
              </button>
              {openFilter === 'order' && (
                <div className="dropdown-menu">
                  <div className="dropdown-content">
                    {ORDER_VALUES.map((value) => (
                      <label key={value} className="radio-option">
                        <input
                          type="radio"
                          name="order"
                          checked={localParams.order === value}
                          onChange={() => setLocalOrder(value)}
                        />
                        {ORDER_LABELS[value]}
                      </label>
                    ))}
                  </div>
                  <div className="dropdown-footer">
                    <button
                      className="btn-reset"
                      onClick={() => handleLocalReset('order')}
                    >
                      초기화
                    </button>
                    <button className="btn-apply" onClick={handleApply}>
                      적용
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="btn-reset-all" onClick={resetAllFilters}>
              ↻ 초기화
            </button>
          </div>
        </div>

        {/* --- Job Posts --- */}
        <section className="job-grid">
          {posts.length === 0 ? (
            <p>검색 결과가 없습니다.</p>
          ) : (
            posts.map((post) => {
              // ... (post mapping logic remains the same) ...
              const dDay = Math.ceil(
                (new Date(post.employmentEndDate).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              );

              return (
                <div key={post.id} className="job-card">
                  <div className="job-card-header">
                    <div className="company-info">
                      <div className="company-logo-placeholder"></div>
                      <span className="company-name">{post.companyName}</span>
                    </div>

                    <button
                      className={`bookmark-btn ${post.isBookmarked ? 'bookmarked' : ''}`}
                      onClick={() => handleBookmarkClick(post)}
                    ></button>
                  </div>

                  <h3 className="job-title">{post.positionTitle}</h3>

                  <div className="job-meta">
                    <span className="job-tag">{post.positionType}</span>
                  </div>

                  <span className="job-deadline">
                    {!post.employmentEndDate
                      ? '상시모집'
                      : dDay < 0
                        ? '마감'
                        : dDay == 0
                          ? 'D-Day'
                          : `마감까지 D-${dDay}`}
                  </span>

                  <p className="job-summary">{post.detailSummary}</p>
                </div>
              );
            })
          )}
        </section>

        {/* 6. Add the Pagination component here */}
        <Pagination
          currentPage={params.page}
          totalPages={totalPages}
          onPageChange={(page) => setPage(page)}
        />
      </main>
    </div>
  );
};

export default HomePage;
