import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import './VehiclesPage.css';
import AddVehicleModal from "../components/AddVehicleModal";
import Pagination from "../components/Pagination";
import { useData } from "../context/DataContext";

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function VehiclesPage() {
    const { vehicles, setVehicles, loading, error, loadVehicles } = useData();
    const [showModal, setShowModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [modalMode, setModalMode] = useState("add");
    const [currentPage, setCurrentPage] = useState(1);
    const [allDrivers, setAllDrivers] = useState([]);

    const fetchAllDrivers = async () => {
        if (allDrivers.length > 0) return; // only fetch once
        try {
            const response = await fetch(`${API_BASE}/api/drivers`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            setAllDrivers(data);
        } catch (err) {
            console.error(err);
        }
    };
    const [formData, setFormData] = useState({
        plate_number: "",
        engine_number: "",
        chassis_number: "",
        color: "",
        make: "",
        model: "",
        year: "",
        vehicle_type: "",
        license_number: ""
    });

    const resetForm = () => {
        setFormData({
            plate_number: "",
            engine_number: "",
            chassis_number: "",
            color: "",
            make: "",
            model: "",
            year: "",
            vehicle_type: "",
            license_number: ""
        });
    };

    // For input fields
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Fetching create vehicle API
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
                const errorData = await response.json();

                alert(errorData.error || "Failed to create vehicle");
                return;
            }

            const data = await response.json();

            setVehicles(prev => [...prev, data]);

            setShowModal(false);

            setFormData({
                plate_number: "",
                engine_number: "",
                chassis_number: "",
                color: "",
                make: "",
                model: "",
                year: "",
                vehicle_type: "",
                license_number: ""
            });

        } catch (error) {
            console.error(error);
        }
    };

    // Fetching delete vehicle API
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

    // For the modal of update vehicle
    const handleUpdateVehicle = async () => {
        if (!selectedVehicle) {
            return;
        }
        fetchAllDrivers();
        setModalMode("update");

        setFormData({
            plate_number: selectedVehicle.plate_number,
            engine_number: selectedVehicle.engine_number,
            chassis_number: selectedVehicle.chassis_number,
            color: selectedVehicle.color,
            make: selectedVehicle.make,
            model: selectedVehicle.model,
            year: selectedVehicle.year,
            vehicle_type: selectedVehicle.vehicle_type,
            license_number: selectedVehicle.license_number
        });

        setShowModal(true);
    };

    // Fetching update vehicle API
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
                const errorData = await response.json();

                alert(errorData.error || "Failed to update vehicle");
                return;
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

    // Fetching search vehicle API
    const handleSearchVehicle = async (e) => {
        const searchTerm = e.target.value;

        try {
            let url = "/api/vehicles";

            if (searchTerm.trim() !== "") {
                url = `/api/vehicles/search?plate_number=${encodeURIComponent(searchTerm)}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            if (!response.ok) {
                throw new Error("Failed to search vehicles");
            }

            const data = await response.json();

            setVehicles(data);
            setCurrentPage(1);

        } catch (err) {
            console.error(err);
        }
    };

    // Pagination and search vehicle 
    const itemsPerPage = 5;
    const totalPages = Math.ceil(vehicles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentVehicles = vehicles.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        loadVehicles();
        setSelectedVehicle(null);
        setCurrentPage(1);
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
                        <input
                            type="text"
                            className="searchBar"
                            placeholder="Search by plate number..."
                            onChange={handleSearchVehicle}
                        />
                        <button
                            className="addBtn"
                            onClick={() => {
                                fetchAllDrivers();
                                resetForm();
                                setModalMode("add");
                                setShowModal(true);
                            }}
                        >Add Vehicle
                        </button>
                        <button className="updateBtn" onClick={handleUpdateVehicle}>Update Vehicle</button>
                        <button className="deleteBtn" onClick={handleDeleteVehicle}> Delete Vehicle</button>
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
                                        <th>Make</th>
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
                                            <td>{vehicle.make}</td>
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
            <AddVehicleModal showModal={showModal} setShowModal={setShowModal} modalMode={modalMode} setModalMode={setModalMode} formData={formData} handleChange={handleChange} handleCreateVehicle={modalMode === "add" ? handleCreateVehicle : handlePatchVehicle} allDrivers={allDrivers} resetForm={resetForm} />
        </>
    );
}
