import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import './Dashboard.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
    const [year, setYear] = useState(new Date().getFullYear());
    const [data, setData] = useState({
        totalViolations: 0,
        mostCommonViolation: 'N/A',
        mostCommonLocation: 'N/A',
        violationsByType: [],
        violationsOverTime: [],
        violationsByLocation: []
    });
    const [loading, setLoading] = useState(true);

    const availableYears = [2023, 2024, 2025, 2026, 2027]; // Update dynamically later if needed

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`/api/violations/dashboard?year=${year}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch dashboard data');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [year]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <>
            <Sidebar />
            <div className="dashboard-container">
                <div className="dashboard-header">
                    <h2 style={{ color: "#FFFFFF", fontSize: "30px", margin: 0 }}>Dashboard</h2>
                    <div className="year-filter">
                        <label htmlFor="year-select" style={{ color: "#FFFFFF", marginRight: "10px" }}>Filter by Year:</label>
                        <select 
                            id="year-select"
                            value={year} 
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="year-dropdown"
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <p style={{ color: "#FFFFFF", padding: "20px" }}>Loading dashboard metrics...</p>
                ) : (
                    <div className="dashboard-content">
                        {/* 1. STAT CARDS */}
                        <div className="stat-cards">
                            <div className="stat-card">
                                <h3>Total Violations</h3>
                                <p className="stat-value">{data.totalViolations}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Most Common Violation</h3>
                                <p className="stat-value text-sm">{data.mostCommonViolation}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Top Region/City</h3>
                                <p className="stat-value text-sm">{data.mostCommonLocation}</p>
                            </div>
                        </div>

                        {/* 2. MAIN GRAPH */}
                        <div className="main-graph-container card">
                            <h3>Violations by Type</h3>
                            <div style={{ width: '100%', height: 350 }}>
                                <ResponsiveContainer>
                                    <BarChart data={data.violationsByType}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                        <XAxis dataKey="violation_type" stroke="#FFF" tick={{fill: '#CCC'}} />
                                        <YAxis stroke="#FFF" tick={{fill: '#CCC'}} />
                                        <Tooltip contentStyle={{backgroundColor: '#1E1E1E', borderColor: '#333'}} />
                                        <Bar dataKey="total" fill="#0088FE" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* BOTTOM GRAPHS */}
                        <div className="bottom-graphs">
                            {/* 3. BOTTOM LEFT GRAPH */}
                            <div className="side-graph card">
                                <h3>Violations Over Time</h3>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={data.violationsOverTime}>
                                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                            <XAxis dataKey="month" stroke="#FFF" tick={{fill: '#CCC'}} />
                                            <YAxis stroke="#FFF" tick={{fill: '#CCC'}} />
                                            <Tooltip contentStyle={{backgroundColor: '#1E1E1E', borderColor: '#333'}} />
                                            <Line type="monotone" dataKey="total" stroke="#FFBB28" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* 4. BOTTOM RIGHT GRAPH */}
                            <div className="side-graph card">
                                <h3>Violations by Region/City</h3>
                                <div style={{ width: '100%', height: 250 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={data.violationsByLocation}
                                                dataKey="total"
                                                nameKey="city"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {data.violationsByLocation.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{backgroundColor: '#1E1E1E', borderColor: '#333'}} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}