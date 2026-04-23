import { useEffect, useState } from 'react';
import Sidebar from "../components/Sidebar";

export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);
    useEffect(() => {
        // Fetch data from our Express backend
        fetch('http://localhost:5000/api/drivers')
            .then(response => response.json())
            .then(data => setDrivers(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);
    return (
        <>
            <Sidebar />
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <h1>LTO Information Management System</h1>
                <h2>Registered Drivers</h2>
                {drivers.length === 0 ? (
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