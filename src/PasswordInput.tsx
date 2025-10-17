import React, { useState } from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import './PasswordInput.css';

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  value,
  onChange,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  return (
    <div className="password-input-container">
      <label htmlFor={name} className="password-label">
        {label}
      </label>

      <div className="password-field">
        <input
          id={name}
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className="password-input"
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="password-toggle"
        >
          {showPassword ? (
            <MdVisibility size={22} color="#555" />
          ) : (
            <MdVisibilityOff size={22} color="#555" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
