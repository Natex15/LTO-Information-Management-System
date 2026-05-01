import { useEffect, useState } from 'react';
import Sidebar from "../components/Sidebar";
import './DriversPage.css';
import AddDriverModal from "../components/AddDriverModal";
import DriverSummaryModal from "../components/DriverSummaryModal";

export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [modalMode, setModalMode] = useState("add");

    const [formData, setFormData] = useState({
        license_number: "",
        full_name: "",
        sex: "",
        address: "",
        date_of_birth: "",
        track_license_number: "",
        license_status: "",
        license_type: "",
        expiration_date: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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
                throw new Error("Failed to create driver");
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
                track_license_number: "",
                license_status: "",
                license_type: "",
                expiration_date: ""
            });

        } catch (error) {

            console.error(error);

        }

    };

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
            track_license_number: selectedDriver.track_license_number,
            license_status: selectedDriver.license_status,
            license_type: selectedDriver.license_type,
            expiration_date: selectedDriver.expiration_date?.split("T")[0]
        });

        setShowModal(true);
    };

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
            throw new Error(`Failed to update driver: ${response.status}`);
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
    return (
        <>
            <Sidebar />
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <div className="headerRow">
                    <h2 style={{ marginBottom: "10px", userSelect: "none", fontSize: "30px", marginLeft: "11px", color: "#FFFFFF" }}>Registered Drivers</h2>
                    <div className="searchRow">
                    <button className="sortBtn">Sort by</button>
                    <input type="text" className="searchBar" placeholder="Search by driver name..."/>
                    <button
                        className="addBtn"
                        onClick={() => {
                            setModalMode("add");
                            setShowModal(true);
                        }}
                    >Add Driver
                    </button>
                    <button className="deleteBtn" onClick={handleDeleteDriver}> Delete Driver</button>
                    <button className="updateBtn" onClick={handleUpdateDriver}>Update Driver</button>
                    </div>
                </div>
                {error ? (
                    <p style={{ color: 'red' }}>Failed to load drivers: {error}</p>
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
                                        <th>Track License Number</th>
                                        <th>License Status</th>
                                        <th>License Type</th>
                                        <th>Expiration Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {drivers.map(driver => (
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
                                            <td>{driver.track_license_number}</td>
                                            <td>{driver.license_status}</td>
                                            <td>{driver.license_type}</td>
                                            <td>{new Date(driver.expiration_date).toISOString().split("T")[0]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <AddDriverModal showModal={showModal} setShowModal={setShowModal} modalMode={modalMode} setModalMode={setModalMode} formData={formData} handleChange={handleChange} handleCreateDriver={modalMode === "add" ? handleCreateDriver : handlePatchDriver}/>
            <DriverSummaryModal showModal={showSummaryModal} setShowModal={setShowSummaryModal} driver={selectedDriver} />
        </>
    );
}