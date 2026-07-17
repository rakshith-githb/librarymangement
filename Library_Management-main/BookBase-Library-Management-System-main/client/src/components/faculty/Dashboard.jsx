import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../App.css';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [libraryInfo, setLibraryInfo] = useState({
        workingHours: null,
        holidays: [],
        issuedBooks: [],
        dueBooks: []
    });
    const [broadcasts, setBroadcasts] = useState([]);
    const [hiddenBroadcasts, setHiddenBroadcasts] = useState(() => {
        const saved = localStorage.getItem('hiddenBroadcasts');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    useEffect(() => {
        localStorage.setItem('hiddenBroadcasts', JSON.stringify([...hiddenBroadcasts]));
    }, [hiddenBroadcasts]);

    const fetchDashboardData = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            setUserData(user);

            const [
                hoursResponse,
                holidaysResponse,
                issuedBooksResponse,
                broadcastsResponse
            ] = await Promise.all([
                axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/settings/working-hours`),
                axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/settings/holidays`),
                axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/faculty/dashboard/${user.facultyId}`),
                axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/broadcasts/dashboard`) // Updated to use dashboard-specific endpoint
            ]);

            setLibraryInfo({
                workingHours: hoursResponse.data,
                holidays: holidaysResponse.data,
                issuedBooks: issuedBooksResponse.data.currentlyIssuedBooks,
                dueBooks: issuedBooksResponse.data.currentlyIssuedBooks.filter(book =>
                    new Date(book.dueDate) < new Date()
                )
            });
            setBroadcasts(broadcastsResponse.data);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard information');
            setLoading(false);
        }
    };

    const hideBroadcast = (broadcastId) => {
        setHiddenBroadcasts(prev => {
            const updated = new Set([...prev]);
            updated.add(broadcastId);
            return updated;
        });
    };

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            {userData && (
                <div className="bg-gradient-to-r bg-white text-customRed p-6 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold mb-2">
                        Welcome back, {userData?.name}! 👋
                    </h1>
                    <p>Faculty ID: {userData?.facultyId}</p>
                </div>
            )}

            {/* Important Broadcasts */}
            {broadcasts.length > 0 && broadcasts.filter(b => !hiddenBroadcasts.has(b._id)).length > 0 && (
                <div className="bg-yellow-50 p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4 text-yellow-800">
                        📢 Important Announcements
                    </h2>
                    <div className="space-y-4">
                        {broadcasts
                            .filter(broadcast => !hiddenBroadcasts.has(broadcast._id))
                            .map(broadcast => (
                            <div
                                key={broadcast._id}
                                className={`p-4 rounded-lg relative ${
                                    broadcast.priority === 'high'
                                        ? 'bg-red-100 border-l-4 border-red-500'
                                        : 'bg-white'
                                }`}
                            >
                                <button 
                                    onClick={() => hideBroadcast(broadcast._id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                                    title="Remove this announcement"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                                <h3 className="font-semibold text-lg">{broadcast.title}</h3>
                                <p className="text-gray-700 mt-1">{broadcast.content}</p>
                                <div className="text-sm text-gray-500 mt-2">
                                    Posted: {new Date(broadcast.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quick Stats */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">📚 Your Library Status</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span>Books Issued:</span>
                            <span className="font-bold text-blue-600">
                                {libraryInfo.issuedBooks.length}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Books Overdue:</span>
                            <span className="font-bold text-red-600">
                                {libraryInfo.dueBooks.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Library Hours */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">🕒 Library Hours</h2>
                    {libraryInfo.workingHours && (
                        <div className="text-center">
                            <p className="text-gray-600">Open from</p>
                            <p className="text-2xl font-bold text-customRed">
                                {libraryInfo.workingHours.start} - {libraryInfo.workingHours.end}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Holidays */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">📅 Upcoming Holidays</h2>
                <div className="grid gap-4">
                    {libraryInfo.holidays
                        .filter(holiday => new Date(holiday.date) >= new Date())
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .map(holiday => (
                            <div
                                key={holiday._id}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div>
                                    <span className="font-medium">{holiday.description}</span>
                                    <p className="text-sm text-gray-600">
                                        {new Date(holiday.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <span className="text-blue-600">
                                    {Math.ceil((new Date(holiday.date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                                </span>
                            </div>
                        ))}
                    {libraryInfo.holidays.filter(holiday => new Date(holiday.date) >= new Date()).length === 0 && (
                        <p className="text-gray-500 text-center">No upcoming holidays</p>
                    )}
                </div>
            </div>

            {/* Library Rules */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">📋 Quick Reminders</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                    <li>Maximum 5 books can be issued at a time</li>
                    <li>Return period is 14 days from issue date</li>
                    <li>Renewals must be done before due date</li>
                    <li>Library hours are subject to change during holidays</li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;