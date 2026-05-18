import { useState } from 'react';
import Sidebar from "../components/Sidebar";
import './ReportsPage.css';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const REPORT_TYPES = [
    { id: 'filtered-drivers', name: 'Filtered Drivers List', description: 'Filter drivers by license type, status, sex, and age range' },
    { id: 'vehicles-by-driver', name: 'Vehicles by Driver', description: 'List all vehicles owned by a specific driver' },
    { id: 'expired-registrations', name: 'Expired Registrations', description: 'Find vehicles with expired registrations as of a date' },
    { id: 'expired-suspended', name: 'Expired / Suspended Licenses', description: 'View all drivers with expired or suspended licenses' },
    { id: 'violations-by-driver', name: 'Violations by Driver', description: 'View violations for a driver within a date range' },
    { id: 'violations-by-type', name: 'Violations Count by Type', description: 'Total violations per type for a given year' },
    { id: 'violations-by-location', name: 'Vehicles in Violations by Location', description: 'Vehicles involved in violations in a given city/region' },
];

export default function ReportsPage() {
    const [selectedReport, setSelectedReport] = useState(null);
    const [results, setResults] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState(null);

    // Filter states
    const [filters, setFilters] = useState({
        license_type: '',
        license_status: '',
        sex: '',
        min_age: '',
        max_age: '',
        license_number: '',
        as_of_date: new Date().toISOString().split('T')[0],
        start_date: '',
        end_date: '',
        year: new Date().getFullYear().toString(),
        location: ''
    });

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const runReport = async () => {
        if (!selectedReport) return;
        setReportLoading(true);
        setReportError(null);
        setResults(null);

        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        try {
            let url = '';
            switch (selectedReport) {
                case 'filtered-drivers': {
                    const params = new URLSearchParams();
                    if (filters.license_type) params.append('license_type', filters.license_type);
                    if (filters.license_status) params.append('license_status', filters.license_status);
                    if (filters.sex) params.append('sex', filters.sex);
                    if (filters.min_age) params.append('min_age', filters.min_age);
                    if (filters.max_age) params.append('max_age', filters.max_age);
                    url = `${API_BASE}/api/reports/drivers?${params.toString()}`;
                    break;
                }
                case 'vehicles-by-driver':
                    if (!filters.license_number) { setReportError('License number is required'); setReportLoading(false); return; }
                    url = `${API_BASE}/api/reports/drivers/${filters.license_number}/vehicles`;
                    break;
                case 'expired-registrations': {
                    const params = new URLSearchParams();
                    if (filters.as_of_date) params.append('as_of_date', filters.as_of_date);
                    url = `${API_BASE}/api/reports/registrations/expired?${params.toString()}`;
                    break;
                }
                case 'expired-suspended':
                    url = `${API_BASE}/api/reports/drivers/expired-suspended`;
                    break;
                case 'violations-by-driver': {
                    if (!filters.license_number) { setReportError('License number is required'); setReportLoading(false); return; }
                    const params = new URLSearchParams();
                    if (filters.start_date) params.append('start_date', filters.start_date);
                    if (filters.end_date) params.append('end_date', filters.end_date);
                    url = `${API_BASE}/api/reports/drivers/${filters.license_number}/violations?${params.toString()}`;
                    break;
                }
                case 'violations-by-type': {
                    const params = new URLSearchParams();
                    if (filters.year) params.append('year', filters.year);
                    url = `${API_BASE}/api/reports/violations/by-type?${params.toString()}`;
                    break;
                }
                case 'violations-by-location': {
                    const params = new URLSearchParams();
                    if (filters.location) params.append('location', filters.location);
                    url = `${API_BASE}/api/reports/violations/by-location?${params.toString()}`;
                    break;
                }
                default:
                    setReportError('Unknown report type');
                    setReportLoading(false);
                    return;
            }

            const response = await fetch(url, { headers });
            if (!response.ok) throw new Error(`Report failed: ${response.status}`);
            const data = await response.json();
            setResults(data);
        } catch (err) {
            console.error(err);
            setReportError(err.message);
        } finally {
            setReportLoading(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try { return new Date(dateStr).toISOString().split("T")[0]; }
        catch { return 'N/A'; }
    };

    const renderFilters = () => {
        switch (selectedReport) {
            case 'filtered-drivers':
                return (
                    <div className="reportFilters">
                        <select name="license_type" value={filters.license_type} onChange={handleFilterChange}>
                            <option value="">All License Types</option>
                            <option value="Student Permit">Student Permit</option>
                            <option value="Non-Professional">Non-Professional</option>
                            <option value="Professional">Professional</option>
                        </select>
                        <select name="license_status" value={filters.license_status} onChange={handleFilterChange}>
                            <option value="">All Statuses</option>
                            <option value="Valid">Valid</option>
                            <option value="Expired">Expired</option>
                            <option value="Suspended">Suspended</option>
                            <option value="Revoked">Revoked</option>
                        </select>
                        <select name="sex" value={filters.sex} onChange={handleFilterChange}>
                            <option value="">All Sexes</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <input type="number" name="min_age" placeholder="Min Age" value={filters.min_age} onChange={handleFilterChange} />
                        <input type="number" name="max_age" placeholder="Max Age" value={filters.max_age} onChange={handleFilterChange} />
                    </div>
                );
            case 'vehicles-by-driver':
                return (
                    <div className="reportFilters">
                        <input type="text" name="license_number" placeholder="Driver License Number" value={filters.license_number} onChange={handleFilterChange} required />
                    </div>
                );
            case 'expired-registrations':
                return (
                    <div className="reportFilters">
                        <label>As of Date</label>
                        <input type="date" name="as_of_date" value={filters.as_of_date} onChange={handleFilterChange} />
                    </div>
                );
            case 'expired-suspended':
                return (
                    <div className="reportFilters">
                        <p className="filterHint">No filters needed — shows all expired and suspended licenses.</p>
                    </div>
                );
            case 'violations-by-driver':
                return (
                    <div className="reportFilters">
                        <input type="text" name="license_number" placeholder="Driver License Number" value={filters.license_number} onChange={handleFilterChange} required />
                        <label>Start Date</label>
                        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} />
                        <label>End Date</label>
                        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} />
                    </div>
                );
            case 'violations-by-type':
                return (
                    <div className="reportFilters">
                        <input type="number" name="year" placeholder="Year" value={filters.year} onChange={handleFilterChange} min="2000" max="2099" />
                    </div>
                );
            case 'violations-by-location':
                return (
                    <div className="reportFilters">
                        <input type="text" name="location" placeholder="City / Region" value={filters.location} onChange={handleFilterChange} />
                    </div>
                );
            default:
                return null;
        }
    };

    const renderResults = () => {
        if (!results || !Array.isArray(results) || results.length === 0) {
            return <p className="noResults">No results found for this report.</p>;
        }

        const columns = Object.keys(results[0]);

        return (
            <div className="reportResultsContainer">
                <div className="reportResultsHeader">
                    <span className="resultsCount">{results.length} record{results.length !== 1 ? 's' : ''} found</span>
                </div>
                <div className="reportTableWrap">
                    <table className="reportTable">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col}>{col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((row, idx) => (
                                <tr key={idx}>
                                    {columns.map(col => (
                                        <td key={col}>
                                            {Array.isArray(row[col])
                                                ? row[col].join(', ')
                                                : col.includes('date') || col === 'date_of_birth' || col === 'expiration_date' || col === 'issuance_date' || col === 'registration_date'
                                                    ? formatDate(row[col])
                                                    : row[col] != null ? String(row[col]) : 'N/A'
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <>
            <Sidebar />
            <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
                <div className="headerRow">
                    <h2 style={{ marginBottom: "10px", userSelect: "none", fontSize: "30px", marginLeft: "11px", color: "#FFFFFF" }}>
                        Reports Center
                    </h2>
                </div>

                {/* Report Type Cards */}
                <div className="reportCardsGrid">
                    {REPORT_TYPES.map(report => (
                        <div
                            key={report.id}
                            className={`reportCard ${selectedReport === report.id ? 'reportCardActive' : ''}`}
                            onClick={() => {
                                setSelectedReport(report.id);
                                setResults(null);
                                setReportError(null);
                            }}
                        >
                            <h3>{report.name}</h3>
                            <p>{report.description}</p>
                        </div>
                    ))}
                </div>

                {/* Filters & Run */}
                {selectedReport && (
                    <div className="reportFilterSection">
                        <h3 className="filterTitle">
                            {REPORT_TYPES.find(r => r.id === selectedReport)?.name}
                        </h3>
                        {renderFilters()}
                        <button className="runReportBtn" onClick={runReport} disabled={reportLoading}>
                            {reportLoading ? 'Running...' : 'Generate Report'}
                        </button>
                    </div>
                )}

                {/* Error */}
                {reportError && (
                    <div className="reportError">
                        <p>{reportError}</p>
                    </div>
                )}

                {/* Results Table */}
                {results && renderResults()}
            </div>
        </>
    );
}
