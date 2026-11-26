import { useNavigate } from "react-router-dom"
import { useState } from "react";
import { authService } from "../src/services/authServices";
import { FaSignOutAlt } from 'react-icons/fa';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        authService.logout();
        setIsLoggedIn(false);
    }

    return (
        <nav className="navContainer">
            <button onClick={() => navigate('/')}>
                Home
            </button>
            <button onClick={() => navigate('/login')}>
                Login
            </button>
            <button onClick={() => navigate('/dashboard')}>
                Dashboard
            </button>
            <button onClick={handleLogoutClick} title="Logout">
                <FaSignOutAlt />
            </button>
        </nav>
    )
}