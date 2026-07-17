import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        facultyId: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/login`, {
                facultyId: formData.facultyId,
                password: formData.password
            });
            localStorage.setItem('token', response.data.token); // Save token after login

            if (response.data.message === 'Login successful') {
                localStorage.setItem('user', JSON.stringify({
                    facultyId: response.data.facultyId,
                    role: response.data.role,
                    email: response.data.email,
                    name: response.data.facultyname
                }));

                if (response.data.role === 'admin') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/faculty/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-100 to-green-300">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md transform transition-all duration-500 hover:scale-105">
                <h2 className="text-2xl font-bold text-center text-green-600 mb-6">Login</h2>
                {error && (
                    <div className="bg-red-100 text-red-600 p-3 rounded mb-4 animate-pulse">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">Faculty ID</label>
                        <input
                            type="text"
                            name="facultyId"
                            value={formData.facultyId}
                            onChange={handleChange}
                            placeholder="Enter your Faculty ID"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                            required
                        />
                    </div>
                    <div className="mb-4 relative">
                        <label className="block text-gray-700 font-medium mb-2">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your Password"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <div className="text-right mb-4">
                        <a
                            href="/forgot-password"
                            className="text-green-600 hover:underline text-sm"
                        >
                            Forgot Password?
                        </a>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition duration-300"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;