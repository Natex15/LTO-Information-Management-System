import { useState } from 'react';
import './Sidebar.css';

export default function Sidebar(){
    const [isOpen, setIsOpen] = useState(false)

    const toggleSidebar = () => setIsOpen(!isOpen)

    return(
        <>
        <div className="app">
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
                    ☰
                </button>
                <nav>
                    <ul>
                        <li><a href="/dashboard">Dashboard</a></li>
                            <ul>
                                <li><a href="/analytics">Analytics</a></li>
                            </ul>
                        <li>Tables</li>
                            <ul>
                                <li><a href="/drivers">Drivers</a></li>
                                <li><a href="/vehicles">Vehicles</a></li>
                                <li><a href="/violations">Violations</a></li>
                            </ul>
                    </ul>
                </nav>
            </aside>
            {!isOpen && (
                <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle sidebar">
                    ☰
                </button>
            )}

            <main className={`main-content ${isOpen ? 'sidebar-open' : ''}`}>
                <div className="header">
                    <div className="greeting">
                        <h1>Welcome Admin!</h1>
                    </div>
                    <a id="logout-button">Logout</a>
                </div>
            </main>
        </div>
        </>
    );
}