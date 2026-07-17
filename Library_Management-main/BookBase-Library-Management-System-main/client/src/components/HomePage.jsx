import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css'; 

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="homepage-container">
            {/* Content */}
            <div className="content-container bg-white bg-opacity-90 p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-4xl font-bold text-purple-700 mb-6 animate-fade-in">
                    📚 Welcome to Department Library
                </h1>
                <p className="text-gray-600 mb-6">
                    📖 Manage your books, track borrowing, and explore the world of knowledge.
                </p>
                <div className="space-x-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 hover:scale-105 transition duration-300"
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;