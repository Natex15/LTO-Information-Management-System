import { useState } from 'react';
import Sidebar from "../components/Sidebar";
import './ViolationsPage.css';
import { useData } from "../context/DataContext";

export default function ViolationsPage() {
    // States
    const { violations, setViolations, loading, error } = useData();
    const [currentPage, setCurrentPage] = useState(1);
    const [showDriverViolationModal, setShowDriverViolationModal] = useState(false);
    const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [driverViolations, setDriverViolations] = useState([]);
    const [driverViolationError, setDriverViolationError] = useState("");
    const itemsPerPage = 5;

    const totalPages = Math.ceil(violations.length / itemsPerPage);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentViolations = violations.slice(startIndex, startIndex + itemsPerPage);

    const [showViolationTypeModal, setShowViolationTypeModal] = useState(false);
    const [availableYears, setAvailableYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState("");
    const [violationTypeCounts, setViolationTypeCounts] = useState([]);
    const [violationTypeError, setViolationTypeError] = useState("");

    // Searching violation by plate num
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

    // Searches driver traffic violations within a date range
    const handleSearchDriverViolations = async (e) => {
        e.preventDefault();

        if (
            driverLicenseNumber.trim() === "" ||
            startDate.trim() === "" ||
            endDate.trim() === ""
        ) {
            setDriverViolationError("Please enter license number, start date, and end date.");
            return;
        }

        const token = localStorage.getItem("token");

        try {
            setDriverViolationError("");

            const response = await fetch(
                `/api/violations/driver-violations/date-range?license_number=${encodeURIComponent(driverLicenseNumber)}&start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(endDate)}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            console.log("Driver violation search result:", data);

            if (!response.ok) {
                throw new Error(data.message || "Failed to search driver violations");
            }

            setDriverViolations(data.violations || []);

        } catch (error) {
            console.error(error);
            setDriverViolationError(
                error instanceof Error
                    ? error.message
                    : "Failed to search driver violations"
            );
        }
    };

    const handleOpenViolationTypeModal = async () => {
    setShowViolationTypeModal(true);
    setViolationTypeCounts([]);
    setViolationTypeError("");
    try {
        const response = await fetch("/api/violations/years", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const data = await response.json();
        setAvailableYears(data);
        setSelectedYear(data[0] ?? "");
    } catch (error) {
        setViolationTypeError(error.message || "Failed to load years.");
    }
};

    const handleSearchViolationTypes = async (e) => {
      e.preventDefault();
      if (!selectedYear) { setViolationTypeError("Please select a year."); return; }
      try {
        setViolationTypeError("");
        const response = await fetch(
            `/api/violations/count-by-type?year=${selectedYear}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        if (!response.ok) throw new Error("Failed to fetch violation counts");
        const data = await response.json();
        setViolationTypeCounts(data);
      } catch (error) {
        setViolationTypeError(error.message || "Failed to fetch violation counts.");
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
                      <button className="violationTypeBtn" onClick={handleOpenViolationTypeModal}>Violations by Type</button>
                        <button className="sortBtn">Sort by</button>
                        <button
                            className="driverViolationSearchBtn"
                            onClick={() => {
                                setShowDriverViolationModal(true);
                                setDriverLicenseNumber("");
                                setStartDate("");
                                setEndDate("");
                                setDriverViolations([]);
                                setDriverViolationError("");
                            }}
                        >
                            Search Driver's Traffic Violations
                        </button>

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
                                            <td>{new Date(violation.date).toISOString().split("T")[0]}</td>
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

            {showDriverViolationModal && (
                <div className="modalOverlay">
                    <div className="modalBox driverViolationModalBox">
                        <h2>Search Driver's Traffic Violations</h2>

                        <form onSubmit={handleSearchDriverViolations}>
                            <input
                                type="text"
                                placeholder="Enter license number..."
                                value={driverLicenseNumber}
                                onChange={(e) => setDriverLicenseNumber(e.target.value)}
                            />

                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />

                            <div className="modalActions">
                                <button type="submit" className="saveBtn">
                                    Search
                                </button>

                                <button
                                    type="button"
                                    className="cancelBtn"
                                    onClick={() => {
                                        setShowDriverViolationModal(false);
                                        setDriverLicenseNumber("");
                                        setStartDate("");
                                        setEndDate("");
                                        setDriverViolations([]);
                                        setDriverViolationError("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>

                        {driverViolationError && (
                            <p className="driverViolationError">{driverViolationError}</p>
                        )}

                        <div className="driverViolationResults">
                            {driverViolations.length === 0 ? (
                                <p className="noDriverViolationResult">
                                    No violations found for this driver within the selected date range.
                                </p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>License Number</th>
                                            <th>Driver Name</th>
                                            <th>Violation</th>
                                            <th>Status</th>
                                            <th>Fine</th>
                                            <th>Officer</th>
                                            <th>Date</th>
                                            <th>Location</th>
                                            <th>Plate Number</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {driverViolations.map((violation, index) => (
                                            <tr key={`${violation.license_number}-${violation.violation_id}-${index}`}>
                                                <td>{violation.license_number}</td>
                                                <td>{violation.full_name}</td>
                                                <td>{violation.violation_type || "N/A"}</td>
                                                <td>{violation.violation_status}</td>
                                                <td>{violation.corresponding_fine_amount}</td>
                                                <td>{violation.apprehending_officer}</td>
                                                <td>{new Date(violation.date).toLocaleDateString()}</td>
                                                <td>{violation.location}</td>
                                                <td>{violation.plate_number}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
        )}
        {showViolationTypeModal && (
    <div className="modalOverlay">
        <div className="modalBox driverViolationModalBox">
            <h2>Violations by Type</h2>
            <form onSubmit={handleSearchViolationTypes}>
                <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                >
                    {availableYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <div className="modalActions">
                    <button type="submit" className="saveBtn">Search</button>
                    <button
                        type="button"
                        className="cancelBtn"
                        onClick={() => {
                            setShowViolationTypeModal(false);
                            setViolationTypeCounts([]);
                            setViolationTypeError("");
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
            {violationTypeError && <p className="driverViolationError">{violationTypeError}</p>}
            <div className="driverViolationResults">
                {violationTypeCounts.length === 0 ? (
                    <p className="noDriverViolationResult">No data found for this year.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Violation Type</th>
                                <th>Count</th>
                            </tr>
                        </thead>
                        <tbody>
                            {violationTypeCounts.map((row, index) => (
                                <tr key={index}>
                                    <td>{row.violation_type}</td>
                                    <td>{row.count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
}
