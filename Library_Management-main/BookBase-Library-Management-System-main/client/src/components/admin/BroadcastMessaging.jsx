import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BroadcastMessaging = () => {
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        priority: 'normal',
        expiresIn: '24'
    });
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/broadcasts`);
            setMessages(response.data);
        } catch (error) {
            setError('Failed to fetch messages');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/broadcast`, formData);
            setFormData({
                title: '',
                content: '',
                priority: 'normal',
                expiresIn: '24'
            });
            fetchMessages();
        } catch (error) {
            setError('Failed to send broadcast message');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Broadcast Messages</h2>
            
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
                {error && (
                    <div className="mb-4 text-red-500">{error}</div>
                )}
                
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="content">
                        Message
                    </label>
                    <textarea
                        id="content"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 h-32"
                        required
                    />
                </div>

                <div className="mb-4 flex gap-4">
                    <div className="w-1/2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                            Priority
                        </label>
                        <select
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            className="shadow border rounded w-full py-2 px-3 text-gray-700"
                        >
                            <option value="normal">Normal</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>

                    <div className="w-1/2">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiresIn">
                            Expires In (hours)
                        </label>
                        <input
                            type="number"
                            id="expiresIn"
                            name="expiresIn"
                            value={formData.expiresIn}
                            onChange={handleChange}
                            min="1"
                            max="72"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {loading ? 'Sending...' : 'Send Broadcast'}
                </button>
            </form>

            <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Recent Messages</h3>
                <div className="space-y-4">
                    {messages.map((msg) => (
                        <div
                            key={msg._id}
                            className={`border rounded-lg p-4 ${
                                msg.priority === 'urgent' ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'
                            }`}
                        >
                            <h4 className="font-semibold text-lg">{msg.title}</h4>
                            <div className="mt-2">
                                <p className="text-gray-600">{msg.content}</p>
                                <div className="mt-2 text-sm text-gray-500 flex justify-between">
                                    <span>Expires in: {msg.expiresIn} hours</span>
                                    <span>Sent: {new Date(msg.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BroadcastMessaging;