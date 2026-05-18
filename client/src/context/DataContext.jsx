import { createContext, useState, useEffect, useContext } from 'react';

const DataContext = createContext();

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function DataProvider({ children }) {
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [violations, setViolations] = useState([]);
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const [driversRes, vehiclesRes, violationsRes, registrationsRes] = await Promise.all([
                fetch(`${API_BASE}/api/drivers`, { headers }),
                fetch(`${API_BASE}/api/vehicles`, { headers }),
                fetch(`${API_BASE}/api/violations`, { headers }),
                fetch(`${API_BASE}/api/registrations`, { headers })
            ]);

            if (!driversRes.ok) throw new Error('Failed to fetch drivers');
            if (!vehiclesRes.ok) throw new Error('Failed to fetch vehicles');
            if (!violationsRes.ok) throw new Error('Failed to fetch violations');
            if (!registrationsRes.ok) throw new Error('Failed to fetch registrations');

            const [driversData, vehiclesData, violationsData, registrationsData] = await Promise.all([
                driversRes.json(),
                vehiclesRes.json(),
                violationsRes.json(),
                registrationsRes.json()
            ]);

            setDrivers(driversData);
            setVehicles(vehiclesData);
            setViolations(violationsData);
            setRegistrations(registrationsData);
            setError(null);
        } catch (err) {
            console.error('Error fetching global data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <DataContext.Provider value={{ drivers, setDrivers, vehicles, setVehicles, violations, setViolations, registrations, setRegistrations, loading, error, loadData }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
