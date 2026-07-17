import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LibrarySettings = () => {
    const [settings, setSettings] = useState({
        maxBooksPerFaculty: 5,
        maxDaysForReturn: 14,
        enableEmailNotifications: true,
        enableSMSNotifications: false,
        enableAutoReminders: true,
        allowBookRenewals: true,
    });


    const [holidays, setHolidays] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [workingHours, setWorkingHours] = useState({
        start: '09:00',
        end: '17:00'
    });

    useEffect(() => {
            fetchHolidays();
            fetchWorkingHours();
        }, []);

    const [newHoliday, setNewHoliday] = useState({
        date: '',
        description: ''
    });

    const handleSettingChange = (settingName, value) => {
        setSettings(prev => ({
            ...prev,
            [settingName]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Implement settings update logic
        alert('Settings updated successfully!');
    };

    const fetchWorkingHours = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/settings/working-hours`);
            setWorkingHours(response.data);
        } catch (error) {
            console.error('Error fetching working hours:', error);
        }
    };

    const fetchHolidays = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/settings/holidays`);
            setHolidays(response.data);
        } catch (error) {
            console.error('Error fetching holidays:', error);
        }
    };

    const handleWorkingHoursSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/settings/working-hours`, workingHours);
            setSuccess('Working hours updated successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error updating working hours');
            setTimeout(() => setError(''), 3000);
        }
    };
        
    const handleAddHoliday = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/settings/holidays`, newHoliday);
            setHolidays([...holidays, response.data]);
            setNewHoliday({ date: '', description: '' });
            setSuccess('Holiday added successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error adding holiday');
            setTimeout(() => setError(''), 3000);
        }
    };
        
    const handleDeleteHoliday = async (holidayId) => {
        try {
            await axios.delete(`${import.meta.env.VITE_BACKEND_API_URL}/api/admin/settings/holidays/${holidayId}`);
            setHolidays(holidays.filter(h => h._id !== holidayId));
            setSuccess('Holiday deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            setError('Error deleting holiday');
            setTimeout(() => setError(''), 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-6 text-gray-800">⚙️ Library Settings</h1>

            {/* Working Hours Section */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Library Working Hours</h2>
                <form onSubmit={handleWorkingHoursSubmit} className="flex gap-4">
                    <input
                        type="time"
                        value={workingHours.start}
                        onChange={(e) => setWorkingHours({...workingHours, start: e.target.value})}
                        className="p-2 border rounded"
                        required
                    />
                    <span className="self-center">to</span>
                    <input
                        type="time"
                        value={workingHours.end}
                        onChange={(e) => setWorkingHours({...workingHours, end: e.target.value})}
                        className="p-2 border rounded"
                        required
                    />
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Update Hours
                    </button>
                </form>
            </div>

            {/* Holidays Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-5">
                <h2 className="text-xl font-semibold mb-4">Library Holidays</h2>
                <form onSubmit={handleAddHoliday} className="flex gap-4 mb-4">
                    <input
                        type="date"
                        value={newHoliday.date}
                        onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                        className="p-2 border rounded"
                        required
                    />
                    <input
                        type="text"
                        value={newHoliday.description}
                        onChange={(e) => setNewHoliday({...newHoliday, description: e.target.value})}
                        placeholder="Holiday Description"
                        className="p-2 border rounded flex-1"
                        required
                    />
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Add Holiday
                    </button>
                </form>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">Date</th>
                                <th className="px-4 py-2">Description</th>
                                <th className="px-4 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {holidays.map((holiday) => (
                                <tr key={holiday._id} className="border-t">
                                    <td className="px-4 py-2">{new Date(holiday.date).toLocaleDateString()}</td>
                                    <td className="px-4 py-2">{holiday.description}</td>
                                    <td className="px-4 py-2">
                                        <button
                                            onClick={() => handleDeleteHoliday(holiday._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mt-5">
                <div className="space-y-6">
                    {/* Book Lending Settings */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Book Lending Settings</h2>
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Maximum Books Per Faculty
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxBooksPerFaculty}
                                    onChange={(e) => handleSettingChange('maxBooksPerFaculty', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                                    min="1"
                                    max="10"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 mb-2">
                                    Maximum Days for Return
                                </label>
                                <input
                                    type="number"
                                    value={settings.maxDaysForReturn}
                                    onChange={(e) => handleSettingChange('maxDaysForReturn', parseInt(e.target.value))}
                                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-400"
                                    min="1"
                                    max="30"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="emailNotifications"
                                    checked={settings.enableEmailNotifications}
                                    onChange={(e) => handleSettingChange('enableEmailNotifications', e.target.checked)}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <label htmlFor="emailNotifications" className="ml-2 text-gray-700">
                                    Enable Email Notifications
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="smsNotifications"
                                    checked={settings.enableSMSNotifications}
                                    onChange={(e) => handleSettingChange('enableSMSNotifications', e.target.checked)}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <label htmlFor="smsNotifications" className="ml-2 text-gray-700">
                                    Enable SMS Notifications
                                </label>
                            </div>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="autoReminders"
                                    checked={settings.enableAutoReminders}
                                    onChange={(e) => handleSettingChange('enableAutoReminders', e.target.checked)}
                                    className="h-4 w-4 text-blue-600"
                                />
                                <label htmlFor="autoReminders" className="ml-2 text-gray-700">
                                    Enable Automatic Reminders
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Book Renewal Settings */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Book Renewal Settings</h2>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="allowRenewals"
                                checked={settings.allowBookRenewals}
                                onChange={(e) => handleSettingChange('allowBookRenewals', e.target.checked)}
                                className="h-4 w-4 text-blue-600"
                            />
                            <label htmlFor="allowRenewals" className="ml-2 text-gray-700">
                                Allow Book Renewals
                            </label>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8">
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LibrarySettings;