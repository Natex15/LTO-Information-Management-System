import { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import Pagination from "../components/Pagination";
import './ViolationsPage.css';
import { useData } from "../context/DataContext";

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const VIOLATION_TYPE_OPTIONS = [
    'Speeding',
    'Reckless Driving',
    'Driving Under the Influence',
    'No License',
    'Expired Registration',
    'Illegal Parking',
    'Running Red Light',
    'No Helmet',
    'Overloading',
    'Illegal Modification',
    'No Insurance',
    'Obstruction',
    'Counterflow',
    'Other'
];

export default function ViolationsPage() {
    const { violations, setViolations, loading, error, loadViolations } = useData();
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState("add");
    const [selectedViolation, setSelectedViolation] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const [formData, setFormData] = useState({
        date: "",
        location: "",
        corresponding_fine_amount: "",
        apprehending_officer: "",
        violation_status: "Unpaid",
        license_number: "",
        plate_number: "",
        violation_types: []
    });

    const resetForm = () => {
        setFormData({
            date: "",
            location: "",
            corresponding_fine_amount: "",
            apprehending_officer: "",
            violation_status: "Unpaid",
            license_number: "",
            plate_number: "",
            violation_types: []
        });
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTypeToggle = (type) => {
        setFormData(prev => ({
            ...prev,
            violation_types: prev.violation_types.includes(type)
                ? prev.violation_types.filter(t => t !== type)
                : [...prev.violation_types, type]
        }));
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE}/api/violations`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error("Failed to create violation");
            const data = await response.json();
            setViolations(prev => [...prev, data]);
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!selectedViolation) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE}/api/violations/${selectedViolation.violation_id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error("Failed to update violation");
            const updated = await response.json();
            setViolations(prev => prev.map(v => v.violation_id === selectedViolation.violation_id ? updated : v));
            setShowModal(false);
            setSelectedViolation(null);
            setModalMode("add");
            resetForm();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async () => {
        if (!selectedViolation) return;
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_BASE}/api/violations/${selectedViolation.violation_id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!response.ok) throw new Error("Failed to delete violation");
            setViolations(prev => prev.filter(v => v.violation_id !== selectedViolation.violation_id));
            setSelectedViolation(null);
        } catch (error) {
            console.error(error);
        }
    };

    const openEditModal = () => {
        if (!selectedViolation) return;
        setModalMode("update");
        setFormData({
            date: selectedViolation.date?.split("T")[0] || "",
            location: selectedViolation.location || "",
            corresponding_fine_amount: selectedViolation.corresponding_fine_amount || "",
            apprehending_officer: selectedViolation.apprehending_officer || "",
            violation_status: selectedViolation.violation_status || "Unpaid",
            license_number: selectedViolation.license_number || "",
            plate_number: selectedViolation.plate_number || "",
            violation_types: selectedViolation.violation_types || []
        });
        setShowModal(true);
    };

    const filteredViolations = violations.filter(v =>
        (v.plate_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.license_number || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.apprehending_officer || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.location || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try { return new Date(dateStr).toISOString().split("T")[0]; }
        catch { return 'N/A'; }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case 'Paid': return 'status-paid';
            case 'Unpaid': return 'status-unpaid';
            case 'Contested': return 'status-contested';
            default: return '';
        }
    };

    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredViolations.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentViolations = filteredViolations.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        loadViolations();
        setSelectedViolation(null);
        setCurrentPage(1);
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
                        <input
                            type="text"
                            className="searchBar"
                            placeholder="Search by plate number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="addBtn" onClick={() => {
                            setModalMode("add");
                            resetForm();
                            setShowModal(true);
                        }}>Record Violation</button>
                        <button className="updateBtn" onClick={openEditModal}>Edit Violation</button>
                        <button className="deleteBtn" onClick={handleDelete}>Delete Violation</button>
                    </div>
                </div>

                {error ? (
                    <p style={{ color: 'red' }}>Failed to load violations: {error}</p>
                ) : loading ? (
                    <p>Loading violations...</p>
                ) : filteredViolations.length === 0 ? (
                    <p style={{ color: '#999' }}>No violations found.</p>
                ) : (
                    <div className="vehicleTableContainer">
                        <div className="vehicleTable">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Types</th>
                                        <th>Status</th>
                                        <th>Fine (₱)</th>
                                        <th>Officer</th>
                                        <th>Date</th>
                                        <th>Location</th>
                                        <th>License #</th>
                                        <th>Plate #</th>
                                    </tr>
                                </thead>
                            <tbody>
                                {currentViolations.map((violation) => (
                                    <tr
                                        key={violation.violation_id}
                                        onClick={() => setSelectedViolation(violation)}
                                        className={selectedViolation?.violation_id === violation.violation_id ? "selectedRow" : ""}
                                    >
                                        <td>{violation.violation_id}</td>
                                        <td>{violation?.violation_types?.length > 0 ? violation.violation_types.join(', ') : 'N/A'}</td>
                                        <td>
                                            <span className={`statusBadge ${getStatusClass(violation.violation_status)}`}>
                                                {violation.violation_status}
                                            </span>
                                        </td>
                                        <td>₱{Number(violation.corresponding_fine_amount).toLocaleString()}</td>
                                        <td>{violation.apprehending_officer || '—'}</td>
                                        <td>{formatDate(violation.date)}</td>
                                        <td>{violation.location}</td>
                                        <td>{violation.license_number}</td>
                                        <td>{violation.plate_number}</td>
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

            {/* Add / Edit Violation Modal */}
            {showModal && (
                <div className="modalOverlay">
                    <div className="modalBox">
                        <h2>{modalMode === "add" ? "Record Violation" : "Edit Violation"}</h2>
                        <form onSubmit={modalMode === "add" ? handleCreate : handleUpdate}>
                            <label>Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required />

                            <input type="text" name="location" placeholder="Location / City" value={formData.location} onChange={handleChange} required />

                            <input type="number" name="corresponding_fine_amount" placeholder="Fine Amount (₱)" value={formData.corresponding_fine_amount} onChange={handleChange} required step="0.01" min="0" />

                            <input type="text" name="apprehending_officer" placeholder="Apprehending Officer (optional)" value={formData.apprehending_officer} onChange={handleChange} />

                            <select name="violation_status" value={formData.violation_status} onChange={handleChange} required>
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                                <option value="Contested">Contested</option>
                            </select>

                            <input type="text" name="license_number" placeholder="Driver License Number" value={formData.license_number} onChange={handleChange} />

                            <input type="text" name="plate_number" placeholder="Vehicle Plate Number" value={formData.plate_number} onChange={handleChange} />

                            <label>Violation Types</label>
                            <div className="violationTypesGrid">
                                {VIOLATION_TYPE_OPTIONS.map(type => (
                                    <label key={type} className="checkboxLabel">
                                        <input
                                            type="checkbox"
                                            checked={formData.violation_types.includes(type)}
                                            onChange={() => handleTypeToggle(type)}
                                        />
                                        <span>{type}</span>
                                    </label>
                                ))}
                            </div>

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
