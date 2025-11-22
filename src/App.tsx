// App.tsx

import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import CreateProfile from './CreateProfile';
import HomePage from './HomePage';
import LoginPage from './LoginPage';
import MyPage from './MyPage';
import SignupPage from './SignupPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/create-profile" element={<CreateProfile />} />
      </Routes>
    </Router>
  );
};

export default App;
