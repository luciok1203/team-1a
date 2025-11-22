import axios, { AxiosError } from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './CreateProfile.css';

const API_BASE = 'https://api-internhasha.wafflestudio.com';

interface SubMajor {
  id: number;
  value: string;
}

// ✅ 프로필 데이터 타입 정의 (any 대체용)
interface ProfileData {
  enrollYear: number;
  department: string;
  cvKey?: string;
  [key: string]: unknown; // 다른 필드가 더 있을 수 있음을 허용
}

const CreateProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { token, logout } = useAuth();

  // ✅ any 대신 구체적인 타입(ProfileData) 사용
  const state = location.state as {
    mode: string;
    profile?: ProfileData;
  } | null;
  const isEditMode = state?.mode === 'edit';

  // --- State ---
  const [enrollYear, setEnrollNumber] = useState('');
  const [mainMajor, setMainMajor] = useState('');
  const [subMajors, setSubMajors] = useState<SubMajor[]>([]);
  const [fileName, setFileName] = useState('');

  // --- Error States ---
  const [idError, setIdError] = useState(false);
  const [majorError, setMajorError] = useState(false);
  const [fileError, setFileError] = useState(false);

  // 0. 초기 데이터 세팅 (수정 모드일 경우)
  useEffect(() => {
    if (isEditMode && state?.profile) {
      const { enrollYear, department, cvKey } = state.profile;

      // 1. 학번 세팅 (예: 2019 -> "19")
      if (enrollYear) {
        const yearStr = String(enrollYear);
        setEnrollNumber(yearStr.length === 4 ? yearStr.slice(2) : yearStr);
      }

      // 2. 전공 세팅 ("주전공,부전공1,부전공2")
      if (department) {
        const majors = department.split(',');
        if (majors.length > 0) {
          setMainMajor(majors[0]); // 첫 번째는 주전공

          // 나머지는 부전공
          const subs = majors.slice(1).map((m: string, index: number) => ({
            id: Date.now() + index,
            value: m,
          }));
          setSubMajors(subs);
        }
      }

      // 3. 파일명 세팅 (경로에서 파일명만 추출)
      if (cvKey) {
        // 예: "static/private/CV/hash_date/filename.pdf" -> "filename.pdf"
        const name = cvKey.split('/').pop();
        // console.log(name);
        setFileName(name || '');
      }
    }
  }, [isEditMode, state]);

  // 토큰 체크
  useEffect(() => {
    const checkToken = async () => {
      if (!token) return;
      try {
        await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (error) {
        const err = error as AxiosError;
        console.error(err.response?.data);
        logout();
      }
    };
    checkToken();
  }, [token, logout]);

  // --- Handlers ---

  // 1. Student ID Logic
  const handleEnrollNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d{0,2}$/.test(val)) {
      setEnrollNumber(val);
      if (val.length === 2) setIdError(false);
    }
  };

  const handleEnrollNumberBlur = () => {
    if (enrollYear.length !== 2) {
      setIdError(true);
    }
  };

  // 2. Major Logic
  const handleMainMajorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMainMajor(e.target.value);
    if (e.target.value.trim().length > 0) {
      setMajorError(false);
    }
  };

  const addSubMajor = () => {
    if (subMajors.length < 6) {
      const newSubMajor = { id: Date.now(), value: '' };
      setSubMajors([...subMajors, newSubMajor]);
    } else {
      alert('다전공은 최대 6개까지 입력 가능합니다.');
    }
  };

  const removeSubMajor = (id: number) => {
    setSubMajors(subMajors.filter((major) => major.id !== id));
  };

  const handleSubMajorChange = (id: number, newValue: string) => {
    setSubMajors(
      subMajors.map((major) =>
        major.id === id ? { ...major, value: newValue } : major
      )
    );
  };

  // 3. File Logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes

      if (file.size > maxSize) {
        setFileError(true);
        setFileName('');
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setFileError(false);
        setFileName(file.name);
      }
    }
  };

  const handleDeleteFile = () => {
    setFileName('');
    setFileError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const department =
      mainMajor +
      (subMajors.length > 0
        ? ',' + subMajors.map((major) => major.value).join(',')
        : '');

    const requestData = {
      enrollYear:
        parseInt(enrollYear) > 25
          ? parseInt(`19${enrollYear}`)
          : parseInt(`20${enrollYear}`),
      department,
      cvKey: `static/private/CV/abcdefghij_20251121/${fileName}`,
    };

    const requestConfig = {
      headers: { Authorization: `Bearer ${token}` },
    };

    try {
      await axios.put(
        `${API_BASE}/api/applicant/me`,
        requestData,
        requestConfig
      );
      // console.log('저장 성공!');
      navigate('/mypage?tab=profile');
    } catch (error) {
      const err = error as AxiosError;
      console.error(err.response?.data);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 4. Save / Submit Logic
  const handleSaveButtonClick = () => {
    let isValid = true;

    // Validate Student ID
    if (enrollYear.length !== 2) {
      setIdError(true);
      isValid = false;
    }

    // Validate Main Major
    if (mainMajor.trim() === '') {
      setMajorError(true);
      isValid = false;
    }

    // Validate File
    if (!fileName) {
      setFileError(true);
      isValid = false;
    }

    if (isValid) {
      handleSave();
    }
  };

  return (
    <div className="container">
      {/* --- Header --- */}
      <header className="header">
        <div
          className="logo"
          onClick={() => {
            navigate('/');
          }}
        >
          스누인턴
        </div>
        <nav className="nav">
          <Link to="/mypage">마이페이지</Link>
          <a
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            로그아웃
          </a>
        </nav>
      </header>

      <div className="cp-content">
        <h1 className="cp-title">
          {isEditMode ? '프로필 수정' : '프로필 생성'}
        </h1>

        <h2 className="cp-section-title">필수 작성 항목</h2>
        <p className="cp-description">아래 항목은 필수로 작성해주세요.</p>

        {/* 1. Student ID */}
        <div className="form-group">
          <label className="form-label">
            학번 <span className="required-star">*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              className={`cp-input ${idError ? 'input-error' : ''}`}
              value={enrollYear}
              onChange={handleEnrollNumberChange}
              onBlur={handleEnrollNumberBlur}
              placeholder="25"
            />
            <span className="input-suffix">학번</span>
          </div>
          {idError && (
            <span className="warning-text">
              두 자리 수 숫자로 작성해주세요. (e.g. 25)
            </span>
          )}
        </div>

        {/* 2. Major */}
        <div className="form-group">
          <label className="form-label">
            학과 <span className="required-star">*</span>
          </label>

          <div className="major-input-row">
            <input
              type="text"
              className={`cp-input ${majorError ? 'input-error' : ''}`}
              value={mainMajor}
              onChange={handleMainMajorChange}
              placeholder="주전공 학과명을 입력해주세요. (예시: 컴퓨터공학부, 경제학부 등)"
            />
          </div>

          {subMajors.map((major) => (
            <div className="major-input-row" key={major.id}>
              <input
                type="text"
                className="cp-input"
                value={major.value}
                onChange={(e) => handleSubMajorChange(major.id, e.target.value)}
                placeholder="다전공 학과명을 입력해주세요."
              />
              <button
                className="delete-btn-outline"
                onClick={() => removeSubMajor(major.id)}
              >
                삭제
              </button>
            </div>
          ))}

          <button className="add-btn" onClick={addSubMajor}>
            추가
          </button>

          {majorError && (
            <span className="warning-text">
              주전공은 필수 작성이며, 다전공은 총 6개 이하로 중복되지 않게
              입력해주세요.
            </span>
          )}
        </div>

        {/* 3. CV Upload */}
        <div className="form-group">
          <label className="form-label">
            이력서 (CV) <span className="required-star">*</span>
          </label>

          {!fileName ? (
            <label
              htmlFor="cv-upload"
              className={`file-upload-box ${fileError ? 'input-error' : ''}`}
            >
              <span className="upload-icon">⬆</span>
              PDF 파일만 업로드 가능해요.
            </label>
          ) : (
            <div className="file-selected-row">
              <input
                type="text"
                className="cp-input"
                value={fileName}
                readOnly
                style={{ color: '#888' }}
              />
              <button className="delete-btn-dark" onClick={handleDeleteFile}>
                삭제
              </button>
            </div>
          )}

          <input
            id="cv-upload"
            type="file"
            accept=".pdf"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            ref={fileInputRef}
          />

          {fileError && (
            <span className="warning-text">
              5MB 이하의 PDF 파일을 올려주세요.
            </span>
          )}
        </div>

        <div className="action-buttons">
          <button className="save-btn" onClick={handleSaveButtonClick}>
            저장
          </button>
          <button className="back-btn" onClick={() => navigate(-1)}>
            뒤로가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProfile;
