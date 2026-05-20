import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import './DriversPage.css';
import AddDriverModal from "../components/AddDriverModal";
import DriverSummaryModal from "../components/DriverSummaryModal";
import Pagination from "../components/Pagination";
import { useData } from "../context/DataContext";

export default function DriversPage() {
    const { drivers, setDrivers, loading, error, loadDrivers } = useData();
    const [showModal, setShowModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [modalMode, setModalMode] = useState("add");
    const [currentPage, setCurrentPage] = useState(1);

    const [formData, setFormData] = useState({
        license_number: "",
        full_name: "",
        sex: "",
        address: "",
        date_of_birth: "",
        issuance_date: "",
        license_status: "",
        license_type: "",
        expiration_date: ""
    });

    // For input fields
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Fetching create driver API
    const handleCreateDriver = async (e) => {

        e.preventDefault();

        const token = localStorage.getItem("token");

        try {

            const response = await fetch(
                "/api/drivers",
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

            alert(errorData.error || "Failed to create driver");
            return;
            }

            const data = await response.json();

            setDrivers(prev => [...prev, data]);

            setShowModal(false);

            setFormData({
                license_number: "",
                full_name: "",
                sex: "",
                address: "",
                date_of_birth: "",
                issuance_date: "",
                license_status: "",
                license_type: "",
                expiration_date: ""
            });

        } catch (error) {

            console.error(error);

        }

    };

    // Fetching delete driver API
    const handleDeleteDriver = async () => {

        if (!selectedDriver) {
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(
                `/api/drivers/${selectedDriver.license_number}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to delete driver");
            }

            setDrivers(prev =>
                prev.filter(driver => driver.license_number !== selectedDriver.license_number)
            );

            setSelectedDriver(null);

        } catch (error) {

            console.error(error);

        }

    };

    // For modal of update driver
    const handleUpdateDriver = async () => {

        if (!selectedDriver) {
            return;
        }

        setModalMode("update");

        setFormData({
            license_number: selectedDriver.license_number,
            full_name: selectedDriver.full_name,
            sex: selectedDriver.sex,
            address: selectedDriver.address,
            date_of_birth: selectedDriver.date_of_birth?.split("T")[0],
            issuance_date: selectedDriver.issuance_date?.split("T")[0] || "",
            license_status: selectedDriver.license_status,
            license_type: selectedDriver.license_type,
            expiration_date: selectedDriver.expiration_date?.split("T")[0]
        });

        setShowModal(true);
    };

    // Fetching update driver API
    const handlePatchDriver = async (e) => {
    e.preventDefault();

    if(!selectedDriver) {
        return;
    }

    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`/api/drivers/${selectedDriver.license_number}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

            if (!response.ok) {
            const errorData = await response.json();

            alert(errorData.error || "Failed to update driver");
            return;
            }

        const updatedDriver = await response.json();

        setDrivers(prev =>
            prev.map(driver =>
                driver.license_number === selectedDriver.license_number ? updatedDriver : driver)
        );

        setSelectedDriver(null);
        setModalMode("add");
        setShowModal(false);

    } catch (error) {
        console.error(error);
    }
};

    // Fetching search driver API
    const handleSearchDriver = async (e) => {
        const searchTerm = e.target.value;

        try {
            let url = "/api/drivers";



            if (searchTerm.trim() !== "") {
                url = `/api/drivers/search?driverName=${encodeURIComponent(searchTerm)}`;
            }

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            const data = await response.json();

            setDrivers(data);
            setCurrentPage(1);

        } catch (err) {
            console.error(err);
        }
    };

    // Pagination and search
    const itemsPerPage = 5;
    const totalPages = Math.ceil(drivers.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentDrivers = drivers.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        loadDrivers();
        setSelectedDriver(null);
        setCurrentPage(1);
    }, []);

    return (
        <>
            <Sidebar />
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <div className="headerRow">
                    <h2 style={{ marginBottom: "10px", userSelect: "none", fontSize: "30px", marginLeft: "11px", color: "#FFFFFF" }}>Registered Drivers</h2>
                    <div className="searchRow">
                    <input type="text" className="searchBar" placeholder="Search by driver name..." onChange={handleSearchDriver}/>
                    <button
                        className="addBtn"
                        onClick={() => {
                            setModalMode("add");
                            setShowModal(true);
                        }}
                    >Add Driver
                    </button>
                    <button className="updateBtn" onClick={handleUpdateDriver}>Update Driver</button>
                    <button className="deleteBtn" onClick={handleDeleteDriver}> Delete Driver</button>
                    </div>
                </div>
                {error ? (
                    <p style={{ color: 'red' }}>Failed to load drivers: {error}</p>
                ) : loading ? (
                    <p>Loading drivers...</p>
                ) : drivers.length === 0 ? (
                    <p>No drivers found. Try adding some via Supabase SQL Editor!</p>
                ) : (
                    <div className = "driverTableContainer">
                        <div className = "driversTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th>License Number</th>
                                        <th>Full Name</th>
                                        <th>Sex</th>
                                        <th>Address</th>
                                        <th>Date of Birth</th>
                                        <th>Issuance Date</th>
                                        <th>License Status</th>
                                        <th>License Type</th>
                                        <th>Expiration Date</th>
                                    </tr>
                                </thead>
                            <tbody>
                                {currentDrivers.map(driver => (
                                    <tr
                                        key={driver.license_number}
                                        onClick={() => setSelectedDriver(driver)}
                                        onDoubleClick={() => setShowSummaryModal(true)}
                                        className={selectedDriver?.license_number === driver.license_number ? "selectedRow" : ""}
                                    >
                                        <td>{driver.license_number}</td>
                                        <td>{driver.full_name}</td>
                                        <td>{driver.sex}</td>
                                        <td>{driver.address}</td>
                                        <td>{new Date(driver.date_of_birth).toISOString().split("T")[0]}</td>
                                        <td>{driver.issuance_date ? new Date(driver.issuance_date).toISOString().split("T")[0] : "N/A"}</td>
                                        <td>{driver.license_status}</td>
                                        <td>{driver.license_type}</td>
                                        <td>{new Date(driver.expiration_date).toISOString().split("T")[0]}</td>
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

            <AddDriverModal showModal={showModal} setShowModal={setShowModal} modalMode={modalMode} setModalMode={setModalMode} formData={formData} handleChange={handleChange} handleCreateDriver={modalMode === "add" ? handleCreateDriver : handlePatchDriver}/>
            <DriverSummaryModal showModal={showSummaryModal} setShowModal={setShowSummaryModal} driver={selectedDriver} />
        </>
    );
}
