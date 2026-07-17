import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalFaculty: 0,
        issuedBooks: 0,
        availableBooks: 0,
        pendingFeedbacks: 0,
        lastUpdated: new Date()
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/dashboard/stats`, {
                headers: {
                    'Content-Type': 'application/json',
                    // Add auth token if you're using authentication
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data) {
                setStats({
                    ...response.data,
                    lastUpdated: new Date()
                });
                setLoading(false);
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError(error.response?.data?.message || 'Failed to load dashboard statistics');
            setLoading(false);
        }
    };

    const renderStats = () => {
        if (loading) {
            return <div className="flex items-center justify-center h-full">
                <div className="text-xl text-gray-600">Loading dashboard...</div>
            </div>;
        }

        if (error) {
            return <div className="bg-red-100 text-red-600 p-4 rounded-lg">
                {error}
                <button 
                    onClick={fetchStats} 
                    className="ml-4 text-blue-600 hover:text-blue-800"
                >
                    Try Again
                </button>
            </div>;
        }

        return (
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Book Statistics Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Book Statistics</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Books:</span>
                                <span className="font-semibold">{stats.totalBooks}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Available:</span>
                                <span className="text-green-600 font-semibold">{stats.availableBooks}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Issued:</span>
                                <span className="text-blue-600 font-semibold">{stats.issuedBooks}</span>
                            </div>
                        </div>
                    </div>

                    {/* Faculty & Feedback Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Faculty & Feedback</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Total Faculty:</span>
                                <span className="font-semibold">{stats.totalFaculty}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Pending Feedbacks:</span>
                                <span className="text-yellow-600 font-semibold">{stats.pendingFeedbacks}</span>
                            </div>
                        </div>
                    </div>

                    {/* System Status Card */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">System Status</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Status:</span>
                                <span className="text-green-600 font-semibold">Online</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Last Updated:</span>
                                <span className="text-gray-600">
                                    {stats.lastUpdated.toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">🏠 Admin Dashboard</h1>
            {renderStats()}
        </div>
    );
};

export default Dashboard;