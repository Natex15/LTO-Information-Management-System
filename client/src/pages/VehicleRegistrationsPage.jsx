import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Pagination from "../components/Pagination";
import './RegistrationsPage.css';
import { useData } from "../context/DataContext";

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function VehicleRegistrationsPage() {
    const { registrations, setRegistrations, vehicles, loading, error, loadRegistrations } = useData();
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedRegistration, setSelectedRegistration] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // For searching 
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter]);

    const [formData, setFormData] = useState({
        registration_number: "",
        plate_number: "",
        registration_date: "",
        expiration_date: "",
        registration_status: "Active"
    });

    const resetForm = () => {
        setFormData({
            registration_number: "",
            plate_number: "",
            registration_date: "",
            expiration_date: "",
            registration_status: "Active"
        });
    };

    // For input fields
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Fetching create registration API
    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE}/api/registrations`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
            const errorData = await response.json();

            alert(errorData.error || "Failed to create registration");
            return;
            }
            const data = await response.json();
            setRegistrations(prev => [...prev, data]);
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error(error);
        }
    };

    // Fetching update registration API
    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedRegistration) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE}/api/registrations/${selectedRegistration.registration_number}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
            const errorData = await response.json();

            alert(errorData.error || "Failed to update registration");
            return;
            }
            const updated = await response.json();
            setRegistrations(prev => prev.map(r =>
                r.registration_number === selectedRegistration.registration_number ? updated : r
            ));
            setShowModal(false);
            setSelectedRegistration(null);
            setModalMode("add");
            resetForm();
        } catch (error) {
            console.error(error);
        }
    };

    // Fetching delete registration API
    const handleDelete = async () => {
        if (!selectedRegistration) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE}/api/registrations/${selectedRegistration.registration_number}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();

                alert(errorData.error || errorData.message || "Failed to delete registration");
                return;
            }
            setRegistrations(prev => prev.filter(r =>
                r.registration_number !== selectedRegistration.registration_number
            ));
            setSelectedRegistration(null);
        } catch (error) {
            console.error(error);
        }
    };

    // For the edit modal
    const openEditModal = () => {
        if (!selectedRegistration) return;
        setModalMode("update");
        setFormData({
            registration_number: selectedRegistration.registration_number || "",
            plate_number: selectedRegistration.plate_number || "",
            registration_date: selectedRegistration.registration_date?.split("T")[0] || "",
            expiration_date: selectedRegistration.expiration_date?.split("T")[0] || "",
            registration_status: selectedRegistration.registration_status || "Active"
        });
        setShowModal(true);
    };

    // For proper formatting of date
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try { return new Date(dateStr).toISOString().split("T")[0]; }
        catch { return 'N/A'; }
    };

    // For status
    const getStatusClass = (status) => {
        switch (status) {
            case 'Active': return 'reg-status-active';
            case 'Expired': return 'reg-status-expired';
            case 'Suspended': return 'reg-status-suspended';
            default: return '';
        }
    };

    // Filtering
    const isExpired = (expirationDate) => {
        if (!expirationDate) return false;
        return new Date(expirationDate) < new Date();
    };

    const filteredRegistrations = registrations.filter(r => {
        const matchesSearch =
            (r.registration_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.plate_number || "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !statusFilter || r.registration_status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentRegistrations = filteredRegistrations.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        loadRegistrations();
        setSelectedRegistration(null);
        setCurrentPage(1);
    }, []);

    return (
        <>
            <Sidebar />
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <div className="headerRow">
                    <h2 style={{ marginBottom: "10px", userSelect: "none", fontSize: "30px", marginLeft: "11px", color: "#FFFFFF" }}>
                        Vehicle Registrations
                    </h2>
                    <div className="searchRow">
                        <select
                            className="sortBtn"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Expired">Expired</option>
                            <option value="Suspended">Suspended</option>
                        </select>
                        <input
                            type="text"
                            className="searchBar"
                            placeholder="Search registrations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="addBtn" onClick={() => {
                            setModalMode("add");
                            resetForm();
                            setShowModal(true);
                        }}>New Registration</button>
                        <button className="updateBtn" onClick={openEditModal}>Edit</button>
                        <button className="deleteBtn" onClick={handleDelete}>Delete</button>
                    </div>
                </div>

                {error ? (
                    <p style={{ color: 'red' }}>Failed to load registrations: {error}</p>
                ) : loading ? (
                    <p>Loading registrations...</p>
                ) : filteredRegistrations.length === 0 ? (
                    <p style={{ color: '#999' }}>No registrations found.</p>
                ) : (
                    <div className="regTableContainer">
                        <div className="regTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Registration #</th>
                                        <th>Plate #</th>
                                        <th>Vehicle</th>
                                        <th>Type</th>
                                        <th>Reg. Date</th>
                                        <th>Expiration</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRegistrations.map((reg) => (
                                        <tr
                                            key={reg.registration_number}
                                            onClick={() => setSelectedRegistration(reg)}
                                            className={selectedRegistration?.registration_number === reg.registration_number ? "selectedRow" : ""}
                                        >
                                            <td>{reg.registration_number}</td>
                                            <td>{reg.plate_number}</td>
                                            <td>{reg.make && reg.model ? `${reg.make} ${reg.model}` : reg.model || 'N/A'}</td>
                                            <td>{reg.vehicle_type || 'N/A'}</td>
                                            <td>{formatDate(reg.registration_date)}</td>
                                            <td className={isExpired(reg.expiration_date) ? 'expired-date' : ''}>
                                                {formatDate(reg.expiration_date)}
                                            </td>
                                            <td>
                                                <span className={`statusBadge ${getStatusClass(reg.registration_status)}`}>
                                                    {reg.registration_status}
                                                </span>
                                            </td>
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

            {/* Add / Edit Registration Modal */}
            {showModal && (
                <div className="modalOverlay">
                    <div className="modalBox">
                        <h2>{modalMode === "add" ? "New Registration" : "Edit Registration"}</h2>
                        <form onSubmit={modalMode === "add" ? handleCreate : handleUpdate}>
                            <input
                                type="text"
                                name="registration_number"
                                placeholder="Registration Number"
                                value={formData.registration_number}
                                onChange={handleChange}
                                required
                                disabled={modalMode === "update"}
                            />

                            {modalMode === "add" ? (
                                <select name="plate_number" value={formData.plate_number} onChange={handleChange} required>
                                    <option value="">Select Vehicle (Plate #)</option>
                                    {vehicles.map(v => (
                                        <option key={v.plate_number} value={v.plate_number}>
                                            {v.plate_number} — {v.make} {v.model} ({v.year})
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input type="text" name="plate_number" value={formData.plate_number} onChange={handleChange} required />
                            )}

                            <label>Registration Date</label>
                            <input type="date" name="registration_date" value={formData.registration_date} onChange={handleChange} required />

                            <label>Expiration Date</label>
                            <input type="date" name="expiration_date" value={formData.expiration_date} onChange={handleChange} required />

                            <select name="registration_status" value={formData.registration_status} onChange={handleChange} required>
                                <option value="Active">Active</option>
                                <option value="Expired">Expired</option>
                                <option value="Suspended">Suspended</option>
                            </select>

                            <div className="modalActions">
                                <button type="submit" className="saveBtn">Save</button>
                                <button type="button" className="cancelBtn" onClick={() => {
                                    setShowModal(false);
                                    setModalMode("add");
                                    resetForm();
                                }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
