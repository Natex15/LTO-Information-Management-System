import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar(){
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()
    const toggleSidebar = () => setIsOpen(!isOpen)

    const handleLogout = () => {
        localStorage.removeItem("token")
        navigate("/")
    }

    return(
        <>
        <div className="app">
            <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
                ☰
            </button>
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <nav>
                    <ul>
                        <li><Link to="/dashboard">Dashboard</Link></li>
                        <li>
                            Tables
                            <ul>
                                <li><Link to="/drivers">Drivers</Link></li>
                                <li><Link to="/vehicles">Vehicles</Link></li>
                                <li><Link to="/violations">Violations</Link></li>
                            </ul>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className={`main-content ${isOpen ? 'sidebar-open' : ''}`}>
                <button onClick={handleLogout} id="logout-button" style={{color: 'black'}}>Logout</button>
            </main>
        </div>
        </>
    );
}