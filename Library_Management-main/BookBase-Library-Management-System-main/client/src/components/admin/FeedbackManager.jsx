import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FeedbackManager = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        fetchFeedbacks();
    }, [filter]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/feedbacks?status=${filter}`);
            setFeedbacks(response.data);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setError('Failed to fetch feedbacks');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (feedbackId, newStatus) => {
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/feedbacks/${feedbackId}`, {
                status: newStatus
            });
            setFeedbacks(feedbacks.map(feedback =>
                feedback._id === feedbackId ? { ...feedback, status: newStatus } : feedback
            ));
        } catch (error) {
            console.error('Error updating feedback status:', error);
            setError('Failed to update feedback status');
        }
    };

    const handleResponseSubmit = async (feedbackId, response) => {
        try {
            await axios.put(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/feedbacks/${feedbackId}/respond`, {
                adminResponse: response
            });
            fetchFeedbacks();
        } catch (error) {
            console.error('Error submitting response:', error);
            setError('Failed to submit response');
        }
    };

    const generateReport = async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_API_URL}/api/admin/feedbacks/report?month=${selectedMonth}`,
                { responseType: 'blob' }
            );
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `feedback-report-${selectedMonth}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error generating report:', error);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">📝 Feedback Manager</h1>

            {/* Error Message */}
            {error && (
                <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
                    {error}
                </div>
            )}

            {/* Filters and Report Generation */}
            <div className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
                <div className="flex gap-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="p-2 border rounded"
                    >
                        <option value="all">All Feedbacks</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
                <div className="flex gap-4">
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 border rounded"
                    />
                    <button
                        onClick={generateReport}
                        disabled={!selectedMonth}
                        className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
                    >
                        Generate Report
                    </button>
                </div>
            </div>

            {/* Feedback List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                {loading ? (
                    <p>Loading feedbacks...</p>
                ) : (
                    <div className="space-y-4">
                        {feedbacks.map((feedback) => (
                            <div key={feedback._id} className="border rounded-lg p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-semibold">{feedback.title}</h3>
                                        <p className="text-sm text-gray-600">
                                            Category: {feedback.category} | 
                                            From: {feedback.facultyname} |
                                            Date: {new Date(feedback.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm ${
                                        feedback.status === 'resolved'
                                            ? 'bg-green-100 text-green-800'
                                            : feedback.status === 'reviewed'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {feedback.status}
                                    </span>
                                </div>
                                <p className="mb-4">{feedback.description}</p>
                                
                                {/* Admin Response Section */}
                                <div className="mt-4 space-y-2">
                                    {feedback.adminResponse ? (
                                        <div className="bg-gray-50 p-3 rounded">
                                            <p className="font-semibold">Admin Response:</p>
                                            <p>{feedback.adminResponse}</p>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                placeholder="Write a response..."
                                                className="flex-1 p-2 border rounded"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        handleResponseSubmit(feedback._id, e.target.value);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Status Update Buttons */}
                                    <div className="flex gap-2 mt-2">
                                        <button
                                            onClick={() => handleStatusUpdate(feedback._id, 'reviewed')}
                                            className="bg-yellow-600 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Mark as Reviewed
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(feedback._id, 'resolved')}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm"
                                        >
                                            Mark as Resolved
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FeedbackManager;