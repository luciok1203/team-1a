import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './MyPage.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

const API_BASE = 'https://api-internhasha.wafflestudio.com';

// --- Interfaces ---
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

// ✅ 프로필 데이터 타입 정의
interface Profile {
  name: string;
  email: string;
  department: string;
  enrollYear: number;
}

// ---------------------------------------------------------
// 1. [하위 컴포넌트] 관심 공고 탭
// ---------------------------------------------------------
const BookmarkedPostsTab = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchBookmarkedPosts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/post/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const postsData = res.data.posts || res.data;
        setBookmarkedPosts(postsData);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    if (token) fetchBookmarkedPosts();
  }, [token]);

  const handleBookmarkClick = async (post: Post) => {
    const url = `${API_BASE}/api/post/${post.id}/bookmark`;
    setBookmarkedPosts((prev) => prev.filter((p) => p.id !== post.id));
    try {
      await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      setBookmarkedPosts((prev) => [...prev, post]);
      alert('북마크 취소에 실패했습니다.');
    }
  };

  if (loading)
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        로딩 중...
      </div>
    );

  return (
    <div className="tab-content-bookmarks">
      {bookmarkedPosts.length === 0 ? (
        <div className="empty-message">
          <p>관심 등록한 공고가 없습니다.</p>
        </div>
      ) : (
        <div className="job-list-container">
          {bookmarkedPosts.map((post) => {
            const now = new Date();
            const end = new Date(post.employmentEndDate);
            const diffTime = end.getTime() - now.getTime();
            const dDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isClosed = post.employmentEndDate && dDay < 0;

            let dateText = '';
            let dateClass = '';

            if (!post.employmentEndDate) {
              dateText = '상시모집';
              dateClass = 'status-blue';
            } else if (isClosed) {
              dateText = '마감';
              dateClass = 'status-red';
            } else if (dDay === 0) {
              dateText = 'D-Day';
              dateClass = 'status-blue';
            } else {
              dateText = `D-${dDay}`;
              dateClass = 'status-blue';
            }

            return (
              <div key={post.id} className="job-row-item">
                <div className="job-left-group">
                  <button
                    className="bookmark-icon-btn"
                    onClick={() => handleBookmarkClick(post)}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21L12 17.5L5 21V5Z"
                        fill="#4B5563"
                      />
                    </svg>
                  </button>
                  <span className="company-name">{post.companyName}</span>
                </div>
                <div className="job-right-group">
                  <span className="job-title">{post.positionTitle}</span>
                  <span className={`job-status ${dateClass}`}>{dateText}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------
// 2. [하위 컴포넌트] 내 정보 탭
// ---------------------------------------------------------
interface MyProfileTabProps {
  onCreateProfile: () => void;
  onProfileLoad: (data: Profile | null) => void;
}

const MyProfileTab = ({
  onCreateProfile,
  onProfileLoad,
}: MyProfileTabProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/api/applicant/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // console.log(res.data);

        // ✅ 수정된 부분: 성공 시 상태 업데이트
        setProfile(res.data);
        onProfileLoad(res.data); // 부모에게 프로필 데이터 전달 (버튼 변경용)
        setLoading(false); // 로딩 상태 해제
      } catch (error) {
        console.error(error);

        // ✅ 수정된 부분: 실패 시 상태 업데이트
        setProfile(null);
        onProfileLoad(null);
        setLoading(false); // 로딩 상태 해제
      }
    };

    if (token) fetchProfile();
  }, [token, onProfileLoad]);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
        내 정보 불러오는 중...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="tab-content-profile">
        <div className="no-profile-box">
          <h2>아직 프로필이 등록되지 않았어요!</h2>
          <p>기업에 소개할 나의 정보를 작성해서 나를 소개해보세요.</p>
          <button className="profile-write-btn" onClick={onCreateProfile}>
            지금 바로 프로필 작성하기
          </button>
        </div>
      </div>
    );
  }

  const deptString = profile.department
    ? profile.department.replace(/,/g, ' · ')
    : '';

  const yearString = profile.enrollYear
    ? `${String(profile.enrollYear).slice(-2)}학번`
    : '';

  return (
    <div className="tab-content-profile">
      <div className="profile-info-container">
        <h2 className="profile-name">{profile.name}</h2>
        <p className="profile-email">{profile.email}</p>
        <p className="profile-detail">
          {deptString} {yearString && ` ${yearString}`}
        </p>
      </div>
    </div>
  );
};

// ---------------------------------------------------------
// 3. [부모 컴포넌트] 메인 페이지
// ---------------------------------------------------------
type MyPageTab = 'bookmarks' | 'profile';

const MyPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [profileData, setProfileData] = useState<Profile | null>(null);

  const queryTab = searchParams.get('tab');
  const activeTab: MyPageTab = (
    queryTab ? queryTab.trim() : 'bookmarks'
  ) as MyPageTab;

  const handleTabClick = (tabName: MyPageTab) => {
    setSearchParams({ tab: tabName });
  };

  const handleProfileBtnClick = () => {
    if (profileData) {
      navigate('/create-profile', {
        state: { mode: 'edit', profile: profileData },
      });
    } else {
      navigate('/create-profile', { state: { mode: 'create' } });
    }
  };

  return (
    <div className="mypage-container">
      <header className="mypage-header">
        <div
          className="logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          스누인턴
        </div>
        <nav className="nav">
          <Link to="/mypage?tab=bookmarks">마이페이지</Link>
          <a
            onClick={() => {
              logout();
              navigate('/');
            }}
            style={{ cursor: 'pointer' }}
          >
            로그아웃
          </a>
        </nav>
      </header>

      <div className="mypage-inner">
        <h1 className="mypage-title">마이페이지</h1>

        <div className="mypage-tabs">
          <div className="tabs-left">
            <button
              className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => handleTabClick('bookmarks')}
            >
              관심공고
            </button>
            <button
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => handleTabClick('profile')}
            >
              내 정보
            </button>
          </div>

          {activeTab === 'profile' && (
            <button
              className="profile-create-btn"
              onClick={handleProfileBtnClick}
            >
              {profileData ? '내 프로필 수정' : '내 프로필 생성'}
            </button>
          )}
        </div>

        <div className="mypage-content">
          {activeTab === 'bookmarks' && <BookmarkedPostsTab />}
          {activeTab === 'profile' && (
            <MyProfileTab
              onCreateProfile={handleProfileBtnClick}
              onProfileLoad={setProfileData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
