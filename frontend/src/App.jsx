import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import IntroPage from './pages/IntroPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Verify2FAPage from './pages/Verify2FAPage';
import Enable2FAPage from './pages/Enable2FAPage';
import Need2FASetupPage from './pages/Need2FASetupPage';
import HomePage from "./pages/HomePage";
import UploadPage from "./pages/UploadPage";
import ProjectDetailPage from "./pages/ProjectDetailPage";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/intro" element={<IntroPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify2fa" element={<Verify2FAPage />} />
                <Route path="/enable-2fa" element={<Enable2FAPage />} />
                <Route path="/need-2fa" element={<Need2FASetupPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/projects/:id" element={<ProjectDetailPage />} />
                <Route path="/" element={<Navigate to="/intro" />} />
                <Route path="*" element={<IntroPage />} />
            </Routes>
        </Router>
    );
}

export default App;
