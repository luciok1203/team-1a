// CreateProfile.tsx

import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './CreateProfile.css';

interface SubMajor {
  id: number;
  value: string;
}

const EditProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { logout } = useAuth();

  // --- State ---
  const [studentId, setStudentId] = useState('');
  const [mainMajor, setMainMajor] = useState('');
  const [subMajors, setSubMajors] = useState<SubMajor[]>([]);
  const [fileName, setFileName] = useState('');

  // --- Error States ---
  const [idError, setIdError] = useState(false);
  const [majorError, setMajorError] = useState(false);
  const [fileError, setFileError] = useState(false);

  // --- Handlers ---

  // 1. Student ID Logic
  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (/^\d{0,2}$/.test(val)) {
      setStudentId(val);
      // Clear error while typing if it becomes valid
      if (val.length === 2) setIdError(false);
    }
  };

  const handleStudentIdBlur = () => {
    // Trigger validation when user leaves the input field
    if (studentId.length !== 2) {
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

      // Check file size
      if (file.size > maxSize) {
        setFileError(true);
        setFileName(''); // Reject the file
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        setFileError(false);
        setFileName(file.name);
      }
    }
  };

  const handleDeleteFile = () => {
    setFileName('');
    setFileError(false); // Reset error when deleting (optional, or keep it if mandatory)
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 4. Save / Submit Logic
  const handleSave = () => {
    let isValid = true;

    // Validate Student ID
    if (studentId.length !== 2) {
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
      // Proceed with save API call
      // navigate('/next-page');
    }
  };

  return (
    <div className="container">
      {/* --- Header --- */}
      <header className="header">
        <div className="logo">스누인턴</div>
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
        <h1 className="cp-title">프로필 생성</h1>

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
              value={studentId}
              onChange={handleStudentIdChange}
              onBlur={handleStudentIdBlur}
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
          <button className="save-btn" onClick={handleSave}>
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

export default EditProfile;
