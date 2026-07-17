import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import '../App.css';

const Header = ({ isSidebarOpen, setIsSidebarOpen, setActiveFeature }) => {
    const navigate = useNavigate();

    const handleMenuClick = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <header className="bg-customRed text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center">
                {!isSidebarOpen && (
                    <button
                        onClick={handleMenuClick}
                        className="p-2 bg-customLightPink rounded-full hover:bg-customPink focus:outline-none mr-4 transition-all duration-200"
                    >
                        <FaBars className="text-white w-5 h-5" />
                    </button>
                )}
                <div className="flex items-center">
                    {/* <img
                        src="https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
                        alt="Book Icon"
                        className="w-10 h-10 mr-3"
                    /> */}

                    <div>
                        <h1 className="text-2xl font-bold leading-tight">Department Library</h1>
                        <h2 className="text-lg font-medium leading-tight">VNRVJIET</h2>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setActiveFeature('👤 Edit Profile')}
                    className="bg-customLightPink text-customRed  px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center shadow-sm border border-customRed-400"
                >
                    <span className="mr-2 text-lg">👤</span>
                    <span className="font-medium">Profile</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="bg-customLightPink text-customRed px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center shadow-sm border border-customRed-400"
                >
                    <span className="mr-2 text-lg">🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </header>
    );
};

export default Header;
