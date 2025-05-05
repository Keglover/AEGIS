import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Verify2FAPage from './pages/Verify2FAPage';
import Enable2FAPage from './pages/Enable2FAPage';
import Need2FASetupPage from './pages/Need2FASetupPage';




function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify2fa" element={<Verify2FAPage />} />
                <Route path="/enable-2fa" element={<Enable2FAPage />} />
                <Route path="/need-2fa" element={<Need2FASetupPage />} />
                <Route path="*" element={<LoginPage />} />
            </Routes>
        </Router>
    );
}

export default App;
