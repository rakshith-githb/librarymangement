import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FacultyFeedback = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Library'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    const fetchFeedbacks = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/faculty/feedbacks?facultyId=${user.facultyId}`);
            setFeedbacks(response.data);
        } catch (error) {
            console.error('Error fetching feedbacks:', error);
            setError('Failed to fetch feedbacks');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const user = JSON.parse(localStorage.getItem('user'));
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/faculty/feedback`, {
                ...formData,
                facultyId: user.facultyId
            });

            setSuccess('Feedback submitted successfully!');
            setFormData({ title: '', description: '', category: 'Library' });
            fetchFeedbacks(); // Refresh the list
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to submit feedback');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">📝 Faculty Feedback</h1>

            {/* Feedback Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4">Submit New Feedback</h2>
                {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
                {success && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 mb-2">Feedback Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="Library">Library</option>
                            <option value="Infrastructure">Infrastructure</option>
                            <option value="Technical">Technical</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            rows="4"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Submit Feedback
                    </button>
                </form>
            </div>

            {/* Previous Feedbacks */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Previous Feedbacks</h2>
                <div className="space-y-4">
                    {feedbacks.map((feedback) => (
                        <div key={feedback._id} className="bg-white p-4 rounded-lg shadow-md">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold">{feedback.title}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    feedback.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                                    feedback.status === 'Reviewed' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {feedback.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Category: {feedback.category}</p>
                            <p className="mt-2">{feedback.description}</p>
                            {feedback.adminResponse && (
                                <div className="mt-3 p-3 bg-gray-50 rounded">
                                    <p className="text-sm font-semibold">Admin Response:</p>
                                    <p className="text-sm">{feedback.adminResponse}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FacultyFeedback;