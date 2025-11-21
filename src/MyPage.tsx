import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import './MyPage.css';

const MyPage = () => {
  const hasProfile = false;
  const navigate = useNavigate(); // 2. Initialize hook

  // 3. Navigation Handler
  const handleCreateProfile = () => {
    navigate('/create-profile');
  };

  return (
    <div className="mypage-container">
      {/* --- Header Nav --- */}
      <header className="mypage-header">
        <div className="nav-left">스누인턴</div>
        <nav className="nav-right">
          <Link to="/mypage">마이페이지</Link>
          <Link to="/login">로그인</Link>
        </nav>
      </header>

      {/* --- Title --- */}
      <h1 className="mypage-title">마이페이지</h1>

      {/* --- Tabs --- */}
      <div className="mypage-tabs">
        <button className="tab-btn">관심공고</button>
        <button className="tab-btn active">내 정보</button>
        {/* Updated Button */}
        <button className="profile-create-btn" onClick={handleCreateProfile}>
          내 프로필 생성
        </button>
      </div>

      {/* --- If no profile exists --- */}
      {!hasProfile && (
        <div className="no-profile-box">
          <h2>아직 프로필이 등록되지 않았어요!</h2>
          <p>기업에 소개할 나의 정보를 작성해서 나를 소개해보세요.</p>

          {/* Updated Button */}
          <button className="profile-write-btn" onClick={handleCreateProfile}>
            지금 바로 프로필 작성하기
          </button>
        </div>
      )}
    </div>
  );
};

export default MyPage;
