import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../Header';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import FacultyRecords from './FacultyRecords';
import BookInventory from './BookInventory';
import FeedbackManager from './FeedbackManager';
import BroadcastMessaging from './BroadcastMessaging';
import LibrarySettings from './LibrarySettings';
import EditProfile from '../EditProfile';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeFeature, setActiveFeature] = useState('🏠 Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const features = [
        { name: '🏠 Dashboard', component: <Dashboard /> },
        { name: '🧑‍🏫 Faculty Records', component: <FacultyRecords /> },
        { name: '📘 Book Inventory', component: <BookInventory /> },
        { name: '📝 Feedback Manager', component: <FeedbackManager /> },
        { name: '💬 Broadcast Messages', component: <BroadcastMessaging /> },
        { name: '⚙️ Library Settings', component: <LibrarySettings /> },
        { name: '👤 Edit Profile', component: <EditProfile /> },
    ];

    const handleFeatureChange = (featureName) => {
        setActiveFeature(featureName);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex flex-col min-h-screen bg-customLightPink">
            <Header
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
                setActiveFeature={handleFeatureChange}
                isAdmin={true}
            />

            <div className="flex flex-1">
                {isSidebarOpen && (
                    <Sidebar
                        features={features}
                        activeFeature={activeFeature}
                        setActiveFeature={handleFeatureChange}
                        handleLogout={handleLogout}
                        setIsSidebarOpen={setIsSidebarOpen}
                    />
                )}

                <div className={`p-8 transition-all duration-300 ${
                    isSidebarOpen ? 'w-full md:w-3/4 lg:w-4/5' : 'w-full'
                } overflow-auto`}>
                    {features.find(f => f.name === activeFeature)?.component}
                </div>
            </div>

            <footer className="bg-gray-800 text-white p-4 text-center">
                <p>&copy; 2025 BookBase Admin Panel. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default AdminDashboard;