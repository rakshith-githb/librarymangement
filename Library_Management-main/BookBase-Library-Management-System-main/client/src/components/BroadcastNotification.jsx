import React, { useEffect, useState } from 'react';
import axios from 'axios';

const BroadcastNotification = ({ showOnLogin = false }) => {
    const [messages, setMessages] = useState([]);
    const [dismissedMessages, setDismissedMessages] = useState(() => {
        // Load dismissed message IDs from localStorage
        const saved = localStorage.getItem('dismissedBroadcasts');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    useEffect(() => {
        if (showOnLogin) {
            fetchMessages();
        }

        // Set up auto-dismiss check
        const interval = setInterval(() => {
            checkForExpiredMessages();
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [showOnLogin]);

    // Save dismissed messages to localStorage when they change
    useEffect(() => {
        localStorage.setItem('dismissedBroadcasts', JSON.stringify([...dismissedMessages]));
    }, [dismissedMessages]);

    const fetchMessages = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/broadcasts`);
            setMessages(response.data);
        } catch (error) {
            console.error('Error fetching broadcasts:', error);
        }
    };

    // Check for messages that should be auto-dismissed after 12 hours
    const checkForExpiredMessages = () => {
        const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours in milliseconds
        
        messages.forEach(msg => {
            const messageDate = new Date(msg.createdAt);
            if (messageDate < twelveHoursAgo) {
                dismissMessage(msg._id);
            }
        });
    };

    const dismissMessage = (messageId) => {
        setDismissedMessages(prev => {
            const updated = new Set([...prev]);
            updated.add(messageId);
            return updated;
        });
    };

    const visibleMessages = messages.filter(msg => !dismissedMessages.has(msg._id));

    if (!showOnLogin || visibleMessages.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
            {visibleMessages.map((msg) => (
                <div
                    key={msg._id}
                    className={`p-4 rounded-lg shadow-lg border-2 animate-slide-in ${
                        msg.priority === 'urgent' 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-blue-50 border-blue-200'
                    }`}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1 pr-2">
                            <h4 className="font-semibold text-sm">{msg.title}</h4>
                            <p className="text-xs mt-1 text-gray-600">{msg.content}</p>
                            <div className="text-xs text-gray-500 mt-2">
                                Priority: {msg.priority} | Expires in: {msg.expiresIn}h
                            </div>
                        </div>
                        <button
                            onClick={() => dismissMessage(msg._id)}
                            className="text-gray-400 hover:text-gray-600 text-lg leading-none ml-2"
                            title="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BroadcastNotification;