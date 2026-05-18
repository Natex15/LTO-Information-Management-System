import { useState } from 'react';
import Sidebar from "../components/Sidebar";
import './VehiclesPage.css';
import AddVehicleModal from "../components/AddVehicleModal";
import Pagination from "../components/Pagination";
import { useData } from "../context/DataContext";

export default function VehiclesPage() {
    // States
    const { vehicles, setVehicles, loading, error } = useData();
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [modalMode, setModalMode] = useState("add");
    const [currentPage, setCurrentPage] = useState(1);

    const [formData, setFormData] = useState({
        plate_number: "",
        engine_number: "",
        chassis_number: "",
        color: "",
        model: "",
        year: "",
        vehicle_type: "",
        license_number: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Create vehicle
    const handleCreateVehicle = async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                "/api/vehicles",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                }
            );

            if (!response.ok) {
                throw new Error("Failed to create vehicle");
            }

            const data = await response.json();

            setVehicles(prev => [...prev, data]);

            setShowModal(false);

            setFormData({
                plate_number: "",
                engine_number: "",
                chassis_number: "",
                color: "",
                model: "",
                year: "",
                vehicle_type: "",
                license_number: ""
            });

        } catch (error) {
            console.error(error);
        }
    };

    // Delete vehicle
    const handleDeleteVehicle = async () => {
        if (!selectedVehicle) {
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `/api/vehicles/${selectedVehicle.plate_number}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete vehicle");
            }

            setVehicles(prev =>
                prev.filter(vehicle => vehicle.plate_number !== selectedVehicle.plate_number)
            );

            setSelectedVehicle(null);

        } catch (error) {
            console.error(error);
        }
    };

    // Prepares modal for updating
    const handleUpdateVehicle = async () => {
        if (!selectedVehicle) {
            return;
        }

        setModalMode("update");

        setFormData({
            plate_number: selectedVehicle.plate_number,
            engine_number: selectedVehicle.engine_number,
            chassis_number: selectedVehicle.chassis_number,
            color: selectedVehicle.color,
            model: selectedVehicle.model,
            year: selectedVehicle.year,
            vehicle_type: selectedVehicle.vehicle_type,
            license_number: selectedVehicle.license_number
        });

        setShowModal(true);
    };

    // Handles the update
    const handlePatchVehicle = async (e) => {
        e.preventDefault();

        if (!selectedVehicle) {
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`/api/vehicles/${selectedVehicle.plate_number}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`Failed to update vehicle: ${response.status}`);
            }

            const updatedVehicle = await response.json();

            setVehicles(prev =>
                prev.map(vehicle =>
                    vehicle.plate_number === selectedVehicle.plate_number ? updatedVehicle : vehicle)
            );

            setSelectedVehicle(null);
            setModalMode("add");
            setShowModal(false);

        } catch (error) {
            console.error(error);
        }
    };

    const itemsPerPage = 5;
    const totalPages = Math.ceil(vehicles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentVehicles = vehicles.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            <Sidebar />
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <div className="headerRow">
                    <h2 style={{ marginBottom: "10px", userSelect: "none", fontSize: "30px", marginLeft: "11px", color: "#FFFFFF" }}>
                        Registered Vehicles
                    </h2>
                    <div className="searchRow">
                      <input
                        type="text"
                        className="searchBar"
                        placeholder="Search by name"
                        value={searchLicense}
                        onChange={handleSearchByDriver}
                      />
                      <input
                        type="date"
                        className="searchBar"
                        value={filterDate}
                        onChange={(e) => { setFilterDate(e.target.value); setShowExpired(false); }}
                        style={{ width: "140px" }}
                      />
                      <button className="violationSearchBtn"
                        onClick={() => {
                          setShowViolationModal(true);
                          setViolationLocation("");
                          setViolationVehicles([]);
                          setViolationSearchError("");
                        }}
                      >Search Vehicles with Violations</button>
                      <button className="fltrBtn" onClick={handleViewExpiredRegistrations}>
                        {showExpired ? "Show All" : "Expired Registrations"}
                      </button>
                      <button className="sortBtn">Sort by</button>
              <input type="text" className="searchBar" placeholder="Search by plate number..." onChange={handleSearchVehicle} />
                      <button className="addBtn" onClick={() => { setModalMode("add"); setShowModal(true); }}>
                        Add Vehicle
                      </button>
                      <button className="deleteBtn" onClick={handleDeleteVehicle}>Delete Vehicle</button>
                      <button className="updateBtn" onClick={handleUpdateVehicle}>Update Vehicle</button>
                    </div>
                </div>
                {error ? (
                    <p style={{ color: 'red' }}>Failed to load vehicles: {error}</p>
                ) : loading ? (
                    <p>Loading vehicles...</p>
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
                                    {currentVehicles.map(vehicle => (
                                        <tr
                                            key={vehicle.plate_number}
                                            onClick={() => setSelectedVehicle(vehicle)}
                                            className={selectedVehicle?.plate_number === vehicle.plate_number ? "selectedRow" : ""}
                                        >
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
                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                        />
                    </div>
                )}
            </div>
            {showViolationModal && (
                <div className="modalOverlay">
                    <div className="modalBox violationModalBox">
                        <h2>Search Vehicles with Violations</h2>

                        <form onSubmit={handleSearchVehiclesWithViolations}>
                            <input
                                type="text"
                                placeholder="Enter city or region..."
                                value={violationLocation}
                                onChange={(e) => setViolationLocation(e.target.value)}
                            />

                            <div className="modalActions">
                                <button type="submit" className="saveBtn">
                                    Search
                                </button>

                                <button
                                    type="button"
                                    className="cancelBtn"
                                    onClick={() => {
                                        setShowViolationModal(false);
                                        setViolationLocation("");
                                        setViolationVehicles([]);
                                        setViolationSearchError("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>

                        {violationSearchError && (
                            <p className="violationError">{violationSearchError}</p>
                        )}

                        <div className="violationResults">
                            {violationVehicles.length === 0 ? (
                                <p className="noViolationResult">
                                    No vehicles with violations found.
                                </p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Plate Number</th>
                                            <th>Model</th>
                                            <th>Color</th>
                                            <th>Vehicle Type</th>
                                            <th>Violations Committed</th>
                                            <th>Location</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {violationVehicles.map((vehicle, index) => (
                                            <tr key={`${vehicle.plate_number}-${index}`}>
                                                <td>{vehicle.plate_number}</td>
                                                <td>{vehicle.model}</td>
                                                <td>{vehicle.color}</td>
                                                <td>{vehicle.vehicle_type}</td>
                                                <td>{vehicle.violation_types || "N/A"}</td>
                                                <td>{vehicle.location}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <AddVehicleModal showModal={showModal} setShowModal={setShowModal} modalMode={modalMode} setModalMode={setModalMode} formData={formData} handleChange={handleChange} handleCreateVehicle={modalMode === "add" ? handleCreateVehicle : handlePatchVehicle} />
        </>
    );
}
