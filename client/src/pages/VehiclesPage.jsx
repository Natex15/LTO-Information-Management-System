import { useEffect, useState } from 'react';
import Sidebar from "../components/Sidebar";
import './VehiclesPage.css';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        fetch('/api/vehicles', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
                return response.json();
            })
            .then(data => {
                setVehicles(data)
                })
            .catch(err => {
                console.error('Error fetching vehicles:', err);
                setError(err.message);
            });
    }, []);

    return (
        <>
            <Sidebar />
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <div className="headerRow">
                    <h2 style={{ marginBottom: "10px", userSelect: "none", fontSize: "30px", marginLeft: "11px", color: "#FFFFFF" }}>
                        Registered Vehicles
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
                    <p style={{ color: 'red' }}>Failed to load vehicles: {error}</p>
                ) : vehicles.length === 0 ? (
                    <p>No vehicles found.</p>
                ) : (
                    <div className="vehicleTableContainer">
                        <div className="vehicleTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Plate Number</th>
                                        <th>Engine Number</th>
                                        <th>Chassis Number</th>
                                        <th>Color</th>
                                        <th>Model</th>
                                        <th>Year</th>
                                        <th>Vehicle Type</th>
                                        <th>License Number</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.map(vehicle => (
                                        <tr key={vehicle.plate_number}>
                                            <td>{vehicle.plate_number}</td>
                                            <td>{vehicle.engine_number}</td>
                                            <td>{vehicle.chassis_number}</td>
                                            <td>{vehicle.color}</td>
                                            <td>{vehicle.model}</td>
                                            <td>{vehicle.year}</td>
                                            <td>{vehicle.vehicle_type}</td>
                                            <td>{vehicle.license_number}</td>
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