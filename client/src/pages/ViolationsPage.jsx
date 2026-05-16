import { useState } from 'react';
import Sidebar from "../components/Sidebar";
import './VehiclesPage.css';
import { useData } from "../context/DataContext";

export default function ViolationsPage() {
    const { violations, setViolations, loading, error } = useData();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(violations.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentViolations = violations.slice(startIndex, startIndex + itemsPerPage);

    const handleSearchViolation = async (e) => {
        const searchTerm = e.target.value;

        try {
            let url = "/api/violations";

            if (searchTerm.trim() !== "") {
                url = `/api/violations/search?plate_number=${encodeURIComponent(searchTerm)}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to search violations");
            }

            const data = await response.json();

            setViolations(data);
            setCurrentPage(1);

        } catch (err) {
            console.error(err);
        }
    };

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
                            onChange={handleSearchViolation}
                        />
                    </div>
                </div>

                {error ? (
                    <p style={{ color: 'red' }}>Failed to load violations: {error}</p>
                ) : loading ? (
                    <p>Loading violations...</p>
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
                                    {currentViolations.map((violation) => (
                                        <tr key={violation.violation_id}>
                                            <td>{violation.violation_id}</td>
                                            <td>
                                                {violation?.violation_types?.length > 0
                                                    ? violation.violation_types.join(', ')
                                                    : 'N/A'}
                                            </td>
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

                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, index) => (
                                <button
                                    key={index + 1}
                                    onClick={() => setCurrentPage(index + 1)}
                                    className={currentPage === index + 1 ? "activePage" : ""}
                                >
                                    {index + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}