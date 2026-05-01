import { useEffect, useState } from 'react';
import Sidebar from "../components/Sidebar";
import './VehiclesPage.css';

export default function ViolationsPage() {
    const [violations, setViolations] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch('/api/violations', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(data => setViolations(data))
            .catch(err => {
                console.error('Error fetching violations:', err);
                setError(err.message);
            });
    }, []);

    return (
        <>
            <Sidebar />
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <div className="headerRow">
                    <h2 style={{ marginBottom: "10px", userSelect: "none", fontSize: "30px", marginLeft: "11px", color: "#FFFFFF" }}>
                        Violations
                    </h2>
                    <div className="searchRow">
                        <button className="sortBtn">Sort by</button>

                        <input
                            type="text"
                            className="searchBar"
                            placeholder="Search by plate number..."
                        />
                    </div>
                </div>

                {error ? (
                    <p style={{ color: 'red' }}>Failed to load violations: {error}</p>
                ) : violations.length === 0 ? (
                    <p>No violations found.</p>
                ) : (
                    <div className="vehicleTableContainer">
                        <div className="vehicleTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Violation ID</th>
                                        <th>Types</th>
                                        <th>Status</th>
                                        <th>Fine Amount</th>
                                        <th>Officer</th>
                                        <th>Date</th>
                                        <th>Location</th>
                                        <th>License Number</th>
                                        <th>Plate Number</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {violations.map((violation) => (
                                        <tr key={violation.violation_id}>
                                            <td>{violation.violation_id}</td>
                                            <td>{violation?.violation_types?.length > 0 ? violation.violation_types.join(', ') : 'N/A'}</td>
                                            <td>{violation.violation_status}</td>
                                            <td>{violation.corresponding_fine_amount}</td>
                                            <td>{violation.apprehending_officer}</td>
                                            <td>{violation.date}</td>
                                            <td>{violation.location}</td>
                                            <td>{violation.license_number}</td>
                                            <td>{violation.plate_number}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}