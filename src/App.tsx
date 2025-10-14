import React from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </Router>
  );
};

export default App;
