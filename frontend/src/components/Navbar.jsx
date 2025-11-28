import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, CheckSquare, Sun, Moon } from 'lucide-react';
import '../styles/Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <div className="brand-icon">
                            <CheckSquare size={24} />
                        </div>
                        <span className="brand-text">Task Manager</span>
                    </Link>

                    <div className="navbar-menu">

                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="nav-link">
                                    Dashboard
                                </Link>

                                <div className="nav-user">
                                    <div className="user-avatar">
                                        <User size={18} />
                                    </div>
                                    <div className="user-info">
                                        <div className="user-name">{user?.name}</div>
                                        <div className="user-role">{user?.role}</div>
                                    </div>
                                </div>

                                <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                                    <LogOut size={18} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="btn btn-ghost btn-sm">
                                    Login
                                </Link>
                                <Link to="/register" className="btn btn-primary btn-sm">
                                    Sign Up
                                </Link>
                            </>
                        )} <button onClick={toggleTheme} className="theme-btn">
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;