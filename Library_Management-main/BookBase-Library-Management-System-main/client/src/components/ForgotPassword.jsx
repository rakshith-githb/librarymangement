import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            console.log('Sending forgot password request for:', email);
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/forgot-password`, {
                email
            });

            console.log('Forgot password response:', response.data);
            
            if (response.data.success) {
                setMessage('Password reset email sent. Please check your inbox and spam folder.');
            }
        } catch (err) {
            console.error('Forgot password error:', err);
            setError(err.response?.data?.message || 'Failed to send password reset email. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-100 to-yellow-300">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold text-center text-yellow-600 mb-6">Forgot Password</h2>
                {message && (
                    <div className="bg-green-100 text-green-600 p-3 rounded mb-4">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 transition duration-300"
                    >
                        Send Reset Link
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;