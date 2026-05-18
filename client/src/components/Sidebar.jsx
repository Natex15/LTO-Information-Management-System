import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Car, FileWarning, LogOut, Menu, ClipboardList, FileSpreadsheet } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const navItems = [
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/drivers', name: 'Drivers', icon: Users },
        { path: '/vehicles', name: 'Vehicles', icon: Car },
        { path: '/registrations', name: 'Registrations', icon: ClipboardList },
        { path: '/violations', name: 'Violations', icon: FileWarning },
        { path: '/reports', name: 'Reports', icon: FileSpreadsheet },
    ];

    return (
        <aside 
            className={`sidebar ${isOpen ? 'open' : ''}`}
        >
            <div className="sidebar-header">
                <div className="icon-wrapper" onClick={() => setIsOpen(!isOpen)}>
                    <Menu size={24} className="menu-icon" />
                </div>
                <span className="logo-text">LTO System</span>
            </div>
            
            <nav className="sidebar-nav">
                <ul>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <li key={item.path}>
                                <Link to={item.path} className={`nav-link ${isActive ? 'active' : ''}`}>
                                    <div className="icon-wrapper">
                                        <Icon size={24} />
                                    </div>
                                    <span className="nav-text">{item.name}</span>
                                </Link>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                    <div className="icon-wrapper">
                        <LogOut size={24} />
                    </div>
                    <span className="nav-text">Logout</span>
                </button>
            </div>
        </aside>
    );
}