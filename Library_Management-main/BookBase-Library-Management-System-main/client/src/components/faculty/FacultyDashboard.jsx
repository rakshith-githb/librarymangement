import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from '../Header';
import Dashboard from './Dashboard';
import ViewAllBooks from './ViewAllBooks';
import MyIssuedBooks from './MyIssuedBooks';
import DueReminders from './DueReminders';
import ExploreArchives from './ExploreArchives';
import EditProfile from '../EditProfile';
import Settings from './Settings';
import FacultyFeedback from './FacultyFeedback';

import FacultyForum from './FacultyForum';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState('🏠 Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const features = [
        { name: '🏠 Dashboard', component: <Dashboard /> },
        { name: '📘 View All Books', component: <ViewAllBooks /> },
        { name: '📄 My Issued Books', component: <MyIssuedBooks /> },
        { name: '⏰ Due Reminders', component: <DueReminders /> },
        { name: '📁 Explore Archives', component: <ExploreArchives /> },
        { name: '👤 Edit Profile', component: <EditProfile /> },
        { name: '⚙️ Settings', component: <Settings /> },
        { name: '📝 Feedback', component: <FacultyFeedback /> },
       // { name: '📚 Book Wishlist', component: <BookWishlist /> },
        { name: '💬 Forum', component: <FacultyForum /> },
    ];

    const handleFeatureChange = (featureName) => {
        setActiveFeature(featureName);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const renderFeature = () => {
        const feature = features.find((f) => f.name === activeFeature);
        return feature?.component || null;
    };

    return (
        <div className="flex flex-col min-h-screen bg-customLightPink">
            {/* Header */}
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                setActiveFeature={handleFeatureChange}
            />


            <div className="flex flex-1">
                {/* Sidebar */}
                {isSidebarOpen && (
                    <Sidebar
                        features={features}
                        activeFeature={activeFeature}
                        setActiveFeature={handleFeatureChange}
                        handleLogout={handleLogout}
                        setIsSidebarOpen={setIsSidebarOpen}
                    />
                )}

                {/* Main Content */}
                <div
                    className={`p-8 transition-all duration-300 ${
                        isSidebarOpen ? 'w-full md:w-3/4 lg:w-4/5' : 'w-full'
                    } overflow-auto`}
                >
                    {renderFeature()}
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white p-4 text-center">
                <p>&copy; 2025 BookBase. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default FacultyDashboard;