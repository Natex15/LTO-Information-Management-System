import { useEffect, useState } from 'react';

export default function DriverSummaryModal({ showModal, setShowModal, driver }) {
    const [vehicles, setVehicles] = useState([]);
    const [violations, setViolations] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (showModal && driver) {
            const loadData = async () => {
                setLoading(true);
                const token = localStorage.getItem("token");

                try {
                    const [vehiclesRes, violationsRes] = await Promise.all([
                        fetch(`/api/vehicles/${driver.license_number}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        }),
                        fetch(`/api/violations/${driver.license_number}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
                    ]);

                    const vehiclesData = vehiclesRes.ok ? await vehiclesRes.json() : [];
                    const violationsData = violationsRes.ok ? await violationsRes.json() : [];

                    setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
                    setViolations(Array.isArray(violationsData) ? violationsData : []);
                } catch (err) {
                    console.error('Error fetching summary:', err);
                    setVehicles([]);
                    setViolations([]);
                } finally {
                    setLoading(false);
                }
            };

            loadData();
        }
    }, [showModal, driver]);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toISOString().split("T")[0];
        } catch (e) {
            return 'Invalid Date';
        }
    };

    if (!showModal || !driver) return null;

    return (
        <div className="modalOverlay">
            <div className="summaryModalBox">
                <div className="summaryHeader">
                    <h2>{driver.full_name || 'Unknown Driver'}</h2>
                    <button
                        className="closeBtn"
                        onClick={() => setShowModal(false)}
                    >
                        ✕
                    </button>
                </div>

                <div className="driverInfo">
                    <p><strong>License Number:</strong> {driver.license_number || 'N/A'}</p>
                    <p><strong>License Status:</strong> <span className={`status ${driver.license_status ? String(driver.license_status).toLowerCase() : ''}`}>{driver.license_status || 'N/A'}</span></p>
                    <p><strong>License Type:</strong> {driver.license_type || 'N/A'}</p>
                </div>

                {loading ? (
                    <p>Loading summary...</p>
                ) : (
                    <>
                        <div className="summarySection">
                            <h3>Registered Vehicles ({vehicles?.length || 0})</h3>
                            {!vehicles || vehicles.length === 0 ? (
                                <p className="noData">No vehicles registered</p>
                            ) : (
                                <div className="summaryTable">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Plate</th>
                                                <th>Model</th>
                                                <th>Year</th>
                                                <th>Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {vehicles.map((vehicle, idx) => (
                                                <tr key={vehicle?.plate_number || idx}>
                                                    <td>{vehicle?.plate_number || 'N/A'}</td>
                                                    <td>{vehicle?.model || 'N/A'}</td>
                                                    <td>{vehicle?.year || 'N/A'}</td>
                                                    <td>{vehicle?.vehicle_type || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="summarySection">
                            <h3>Violations ({violations?.length || 0})</h3>
                            {!violations || violations.length === 0 ? (
                                <p className="noData">No violations recorded</p>
                            ) : (
                                <div className="summaryTable">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Types</th>
                                                <th>Status</th>
                                                <th>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {violations.map((violation, idx) => (
                                                <tr key={idx}>
                                                    <td>{formatDate(violation?.date)}</td>
                                                    <td>{violation?.violation_types?.length > 0 ? violation.violation_types.join(', ') : 'N/A'}</td>
                                                    <td>{violation?.violation_status || 'N/A'}</td>
                                                    <td>{violation?.corresponding_fine_amount || 'N/A'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
