import { useState, useEffect } from 'react';
import { FaUserCircle, FaCamera, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import '../App.css';

const EditProfile = () => {
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        facultyId: '',
        email: '',
        mobile: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [originalFormData, setOriginalFormData] = useState({}); // Store original data for cancel operation
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [showToast, setShowToast] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        // Load user data
        const fetchUserDetails = async () => {
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                try {
                    // Get the user data from the API
                    const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/profile/${user.facultyId}`);
                    
                    // Create userData object from response
                    const userData = {
                        username: response.data.facultyname || '',
                        facultyId: response.data.facultyId || '',
                        email: response.data.email || '',
                        mobile: response.data.mobile || '',
                        profileImage: response.data.profileImage || '',
                    };
                    
                    // Set both formData and originalFormData with the same values
                    setFormData(userData);
                    setOriginalFormData({...userData});
                    
                    // Set profile photo if it exists
                    if (response.data.profileImage) {
                        setProfilePhoto(`${import.meta.env.VITE_BACKEND_API_URL}/${response.data.profileImage}`);
                    }
                    
                    console.log('Profile data loaded:', userData);
                } catch (error) {
                    console.error('Error fetching user details:', error.response?.data || error.message);
                }
            }
        };
        
        fetchUserDetails();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const photoFormData = new FormData(); // Renamed from formData to photoFormData
            photoFormData.append('profileImage', file);

            try {
                const response = await axios.put(
                    `${import.meta.env.VITE_BACKEND_API_URL}/api/auth/profile/${formData.facultyId}/image`,
                    photoFormData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                setProfilePhoto(`${import.meta.env.VITE_BACKEND_API_URL}/${response.data.profileImage}`);
                console.log('Profile image updated successfully:', response.data);
            } catch (error) {
                console.error('Error uploading profile image:', error.response?.data?.message || error.message);
            }
        }
    };

    // Update handleSubmit function to only display success message on actual submission
    // Update this section in your component - around line 95-145
const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if we're actually in edit mode and have changes before submitting
    if (!isEditing) {
        console.log('Not in edit mode, ignoring submit');
        return;
    }
    
    console.log('Form submitted', formData);
    console.log('Original data', originalFormData);
    
    try {
        // Make API request to update profile
        console.log('Sending update to:', `${import.meta.env.VITE_BACKEND_API_URL}/api/auth/profile/${formData.facultyId}`);
        console.log('With data:', {
            facultyname: formData.username,
            email: formData.email,
            mobile: formData.mobile,
        });
        
        const response = await axios.put(
            `${import.meta.env.VITE_BACKEND_API_URL}/api/auth/profile/${formData.facultyId}`,
            {
                facultyname: formData.username,
                email: formData.email,
                mobile: formData.mobile,
            }
        );
        
        console.log('Update response:', response.data);
        
        if (response.status === 200) {
            // Update local storage
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.facultyname = formData.username;
                user.email = formData.email;
                user.mobile = formData.mobile;
                localStorage.setItem('user', JSON.stringify(user));
            }
            
            // Update original data to match current data
            setOriginalFormData({...formData});
            setIsEditing(false);
            setUpdateSuccess(true);
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        console.error('Response data:', error.response?.data);
        console.error('Error message:', error.message);
        // Show error message to user
        alert(`Failed to update profile: ${error.response?.data?.message || error.message}`);
    }
};

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };
    const handleEditClick = (e) => {
        e.preventDefault(); // Add this to prevent any form submission
        console.log('Edit button clicked');
        console.log('Current form data:', formData);
        console.log('Current isEditing state:', isEditing);
        setIsEditing(true);
        // Make a copy of the current data as originalFormData if it's not already set
        if (Object.keys(originalFormData).length === 0) {
            setOriginalFormData({...formData});
        }
    };

    const handleCancelClick = () => {
        // Restore original data
        setFormData({...originalFormData});
        setIsEditing(false);
    };
    const showSuccessToast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        try {
            const response = await axios.put(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/change-password/${formData.facultyId}`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setShowPasswordChange(false);
            setShowPasswords({
                current: false,
                new: false,
                confirm: false
            });
            showSuccessToast();
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Failed to update password');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-customLightPink">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300">
                    <div className="flex items-center">
                        <span className="mr-2">✓</span>
                        Password updated successfully!
                    </div>
                </div>
            )}

            <div className="p-6">
                <div className="flex justify-center items-center flex-1 p-6">
                    <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-2xl border border-gray-100">
                       
                        <div className="text-center">
                        <h1 className="text-3xl font-bold mb-2 text-indigo-800  items-center">    
                            Faculty Profile
                        </h1>
                            <p className="mt-2 mb-2">Your profile information</p>
                        </div>
                        
                        <form 
    onSubmit={handleSubmit} 
    className="space-y-6"
    onClick={(e) => {
        // Prevent form submission when clicking on the form
        if (e.target.tagName === 'FORM') {
            e.preventDefault();
        }
    }}
>
                            {updateSuccess && (
                            <div className="bg-green-100 text-green-600 p-3 rounded mb-4 animate-pulse">
                                Profile updated successfully!
                            </div>
                        )}
                            {/* Profile Photo */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group">
                                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 ${isEditing ? 'border-indigo-500' : 'border-gray-200'} shadow-md transition-all duration-300`}>
                                        {profilePhoto ? (
                                            <img
                                                src={profilePhoto}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                <FaUserCircle className="w-24 h-24 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {isEditing && (
                                        <label className="absolute bottom-0 right-0 cursor-pointer bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300">
                                            <FaCamera className="w-5 h-5" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                
                                {isEditing && (
                                    <p className="text-sm text-gray-500 mt-2">Click the camera icon to update your photo</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Username */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${
                                            isEditing 
                                                ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white' 
                                                : 'border-gray-200 bg-gray-50 text-gray-700'
                                        }`}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* Faculty ID */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Faculty ID</label>
                                    <input
                                        type="text"
                                        name="facultyId"
                                        value={formData.facultyId}
                                        className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-700"
                                        disabled
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${
                                            isEditing 
                                                ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white' 
                                                : 'border-gray-200 bg-gray-50 text-gray-700'
                                        }`}
                                        disabled={!isEditing}
                                        required
                                    />
                                </div>

                                {/* Mobile Number */}
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">Mobile Number</label>
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        placeholder="Enter your Mobile Number"
                                        className={`w-full border rounded-lg px-4 py-3 focus:outline-none ${
                                            isEditing 
                                                ? 'border-indigo-300 focus:ring-2 focus:ring-indigo-500 bg-white' 
                                                : 'border-gray-200 bg-gray-50 text-gray-700'
                                        }`}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="pt-4 border-t border-gray-100 flex justify-end space-x-4 mt-8">
                                {!isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordChange(true)}
                                            className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-md transition-all duration-300 font-medium"
                                        >
                                            Change Password
                                        </button>
                                        <button
                                            type="button" // Ensure this is type="button" not "submit"
                                            onClick={handleEditClick}
                                            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-md transition-all duration-300 font-medium"
                                        >
                                            Edit Profile
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleCancelClick}
                                            className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition-all duration-300 font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md transition-all duration-300 font-medium"
                                        >
                                            Save Changes
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>

                        {/* Password Change Modal */}
                        {showPasswordChange && (
                            <div className="fixed inset-0 backdrop-filter backdrop-blur-md flex items-center justify-center z-50" style={{backgroundColor: 'rgba(239, 218, 215, 0.4)'}}>
                                <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                                    <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                                    
                                    {passwordError && (
                                        <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
                                            {passwordError}
                                        </div>
                                    )}

                                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.current ? 'text' : 'password'}
                                                    name="currentPassword"
                                                    value={passwordData.currentPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('current')}
                                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    name="newPassword"
                                                    value={passwordData.newPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('new')}
                                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    name="confirmPassword"
                                                    value={passwordData.confirmPassword}
                                                    onChange={handlePasswordChange}
                                                    className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => togglePasswordVisibility('confirm')}
                                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-end space-x-3 mt-6">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowPasswordChange(false);
                                                    setPasswordData({
                                                        currentPassword: '',
                                                        newPassword: '',
                                                        confirmPassword: ''
                                                    });
                                                    setPasswordError('');
                                                    setShowPasswords({
                                                        current: false,
                                                        new: false,
                                                        confirm: false
                                                    });
                                                }}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                Update Password
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;