import { createContext, useState, useEffect, useContext } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
    const [drivers, setDrivers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [violations, setViolations] = useState([]);
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
            const [driversRes, vehiclesRes, violationsRes] = await Promise.all([
                fetch('/api/drivers', { headers }),
                fetch('/api/vehicles', { headers }),
                fetch('/api/violations', { headers })
            ]);

            if (!driversRes.ok) throw new Error('Failed to fetch drivers');
            if (!vehiclesRes.ok) throw new Error('Failed to fetch vehicles');
            if (!violationsRes.ok) throw new Error('Failed to fetch violations');

            const [driversData, vehiclesData, violationsData] = await Promise.all([
                driversRes.json(),
                vehiclesRes.json(),
                violationsRes.json()
            ]);

            setDrivers(driversData);
            setVehicles(vehiclesData);
            setViolations(violationsData);
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
        <DataContext.Provider value={{ drivers, setDrivers, vehicles, setVehicles, violations, setViolations, loading, error, loadData }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}
