import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTheme } from './ThemeContext';
import { 
    FiHome, 
    FiUsers, 
    FiUserCheck, 
    FiFileText, 
    FiArchive, 
    FiSettings, 
    FiLogOut,
    FiMenu,
    FiUser
} from 'react-icons/fi';

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);
    const [navCollapsed, setNavCollapsed] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const { theme, toggleTheme, setTheme } = useTheme();

    const today = useMemo(() => {
        try {
            return new Date().toLocaleDateString(undefined, {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch (_) { return ''; }
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/', { replace: true });
    };

    const isActive = (path) => location.pathname === path;
    const isSettingsSection = location.pathname.startsWith('/settings');


    // Apply user appearance (theme, brand color, background image)
    React.useEffect(() => {
        if (!user) return;
        if (user.theme_mode) {
            try { setTheme(user.theme_mode); } catch (_) {}
        }
        if (user.theme_color) {
            document.documentElement.style.setProperty('--brand', user.theme_color);
        }
        if (user.bg_image_path) {
            document.documentElement.style.setProperty('--app-bg-image', `url('/${user.bg_image_path}')`);
            document.documentElement.style.setProperty('--app-bg-opacity', '0.2'); // Show uploaded background
        } else {
            document.documentElement.style.setProperty('--app-bg-image', 'none');
            document.documentElement.style.setProperty('--app-bg-opacity', '0'); // No background
        }
    }, [user]);

    return (
        <div className={`admin-layout ${navCollapsed ? 'nav-collapsed' : ''}`}>
            <nav className={`sidebar${menuOpen ? ' open' : ''}`}>
                <div className="nav-section">
                    <div className="section-title">ADMIN NAVIGATION</div>
                </div>
                <ul className="nav-menu">
                    <li className={isActive('/dashboard') ? 'active' : ''}>
                        <Link to="/dashboard">
                            <FiHome className="nav-icon" />
                            <span className="label">Dashboard</span>
                        </Link>
                    </li>
                    <li className={isActive('/faculty') ? 'active' : ''}>
                        <Link to="/faculty">
                            <FiUserCheck className="nav-icon" />
                            <span className="label">Faculty</span>
                        </Link>
                    </li>
                    <li className={isActive('/students') ? 'active' : ''}>
                        <Link to="/students">
                            <FiUsers className="nav-icon" />
                            <span className="label">Students</span>
                        </Link>
                    </li>
                    <li className={isActive('/reports') ? 'active' : ''}>
                        <Link to="/reports">
                            <FiFileText className="nav-icon" />
                            <span className="label">Report</span>
                        </Link>
                    </li>
                    <li className={isActive('/archives') ? 'active' : ''}>
                        <Link to="/archives">
                            <FiArchive className="nav-icon" />
                            <span className="label">Archives</span>
                        </Link>
                    </li>
                    <li className={isSettingsSection ? 'active' : ''}>
                        <Link to="/settings">
                            <FiSettings className="nav-icon" />
                            <span className="label">System Settings</span>
                        </Link>
                    </li>
                </ul>
                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {user?.avatar_path ? (
                                <img
                                    src={user.avatar_path.startsWith('http') ? user.avatar_path : `/${user.avatar_path}`}
                                    alt="Avatar"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                />
                            ) : (
                                (user?.name || user?.email || 'U').toString().charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="user-details">
                            <span className="user-name">{user?.name || user?.email}</span>
                            <span className="user-role">System Administrator</span>
                        </div>
                    </div>
                    <button className="btn-logout" onClick={handleLogout}>
                        <FiLogOut className="nav-icon" />
                        <span className="label">Logout</span>
                    </button>
                </div>
            </nav>
            <main className="main-content">
                <div className="content-header">
                    <div className="header-left">
                        <button
                            type="button"
                            className="nav-toggle"
                            onClick={() => setNavCollapsed(v => !v)}
                            aria-label={navCollapsed ? 'Open navigation' : 'Close navigation'}
                            title={navCollapsed ? 'Open navigation' : 'Close navigation'}
                        >
                            <FiMenu />
                        </button>
                        <div className="brand" style={{display:'flex', alignItems:'center', gap:'12px'}}>
                            <img className="logo-small" src="/images/hcc-logo.png" alt="HCC" style={{width:32, height:32, borderRadius:8}}
                                onError={(e)=>{ if(!e.currentTarget.dataset.fallback){ e.currentTarget.dataset.fallback='1'; e.currentTarget.src='/images/hcc-logo.png.png'; } }}
                            />
                            <div>
                                <h1 style={{margin:0, fontSize:'1.1rem'}}>Holy Child College</h1>
                                <p style={{margin:0, fontSize:'0.8rem', opacity:0.8}}>Admin Portal</p>
                            </div>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="user-menu" onClick={() => setUserMenuOpen(v => !v)}>
                            <div className="user-avatar">
                                {user?.avatar_path ? (
                                    <img
                                        src={user.avatar_path.startsWith('http') ? user.avatar_path : `/${user.avatar_path}`}
                                        alt="Avatar"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                    />
                                ) : (
                                    (user?.name || user?.email || 'U').toString().charAt(0).toUpperCase()
                                )}
                            </div>
                            <div className="user-info">
                                <span className="user-name">{user?.name || user?.email}</span>
                                <span className="user-role">System Administrator</span>
                            </div>
                        </div>
                        {userMenuOpen && (
                            <div className="user-dropdown" onClick={(e)=>e.stopPropagation()}>
                                <div className="dropdown-header">
                                    <div className="user-avatar">
                                        {user?.avatar_path ? (
                                            <img
                                                src={user.avatar_path.startsWith('http') ? user.avatar_path : `/${user.avatar_path}`}
                                                alt="Avatar"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                                            />
                                        ) : (
                                            (user?.name || user?.email || 'U').toString().charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="user-details">
                                        <span className="user-name">{user?.name || user?.email}</span>
                                        <span className="user-role">System Administrator</span>
                                    </div>
                                </div>
                                <ul className="dropdown-list">
                                    <li className="dropdown-item">
                                        <Link to="/account" onClick={()=>setUserMenuOpen(false)}>
                                            <FiUser className="dropdown-icon" />
                                            My Profile
                                        </Link>
                                    </li>
                                    <li className="dropdown-item">
                                        <button onClick={handleLogout}>
                                            <FiLogOut className="dropdown-icon" />
                                            Logout
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <div className="content-wrapper" onClick={() => userMenuOpen && setUserMenuOpen(false)}>
                    {children}
                </div>
            </main>
        </div>
    );
}
