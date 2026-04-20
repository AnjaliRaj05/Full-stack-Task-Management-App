import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, CheckSquare, Sun, Moon } from 'lucide-react';
import WorkspaceSwitcher from './WorkspaceSwitcher';
import Avatar from './Avatar';
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
          {/* Left: Brand */}
          <Link to="/" className="navbar-brand">
            <div className="brand-icon">
              <CheckSquare size={24} />
            </div>
            <span className="brand-text">Taskora</span>
          </Link>

          {/* Center: Workspace switcher + nav links + user info */}
          {isAuthenticated && (
            <div className="navbar-center">
              <WorkspaceSwitcher />
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/kanban" className="nav-link">
                Kanban
              </Link>
              <div className="nav-user">
                <Avatar name={user?.fullname || user?.name || 'U'} size="sm" />
                <div className="user-info">
                  <div className="user-name">{user?.fullname || user?.name}</div>
                  <div className="user-role">{user?.role}</div>
                </div>
              </div>
            </div>
          )}

          {/* Right: Actions */}
          <div className="navbar-menu">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </>
            )}
            <button onClick={toggleTheme} className="theme-btn">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
