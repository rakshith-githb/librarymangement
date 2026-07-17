import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import FacultyDashboard from './components/faculty/FacultyDashboard';
import AdminDashboard from './components/admin/AdminDashboard'; // Add this import
import EditProfile from './components/EditProfile';
import BroadcastNotification from './components/BroadcastNotification';

const App = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                    <Route path="/faculty/edit-profile" element={<EditProfile />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* Add this route */}
                </Routes>
            </Router>
            <BroadcastNotification />
        </>
    );
};

export default App;