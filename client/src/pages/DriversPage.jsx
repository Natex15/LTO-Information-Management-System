import { useEffect, useState } from 'react';
import Sidebar from "../components/Sidebar";

export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch('/api/drivers', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(data => setDrivers(data))
            .catch(err => {
                console.error('Error fetching data:', err);
                setError(err.message);
            });
    }, []);

    return (
        <>
            <Sidebar />
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <h1>LTO Information Management System</h1>
                <h2>Registered Drivers</h2>
                {error ? (
                    <p style={{ color: 'red' }}>Failed to load drivers: {error}</p>
                ) : drivers.length === 0 ? (
                    <p>No drivers found. Try adding some via Supabase SQL Editor!</p>
                ) : (
                    <table border="1" cellPadding="10">
                        <thead>
                            <tr>
                                <th>License Number</th>
                                <th>Full Name</th>
                                <th>Status</th>
                                <th>License Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {drivers.map(driver => (
                                <tr key={driver.license_number}>
                                    <td>{driver.license_number}</td>
                                    <td>{driver.full_name}</td>
                                    <td>{driver.license_status}</td>
                                    <td>{driver.license_type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}