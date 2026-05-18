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

    const getHeaders = () => {
        const token = localStorage.getItem("token");

        return {
            Authorization: `Bearer ${token}`
        };
    };

    const loadDrivers = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/api/drivers`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch drivers");
            }

            const data = await response.json();

            setDrivers(data);
            setError(null);

        } catch (err) {
            console.error("Error fetching drivers:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadVehicles = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/api/vehicles`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch vehicles");
            }

            const data = await response.json();

            setVehicles(data);
            setError(null);

        } catch (err) {
            console.error("Error fetching vehicles:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadViolations = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/api/violations`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch violations");
            }

            const data = await response.json();

            setViolations(data);
            setError(null);

        } catch (err) {
            console.error("Error fetching violations:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadRegistrations = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(`${API_BASE}/api/registrations`, {
                headers: getHeaders()
            });

            if (!response.ok) {
                throw new Error("Failed to fetch registrations");
            }

            const data = await response.json();

            setRegistrations(data);
            setError(null);

        } catch (err) {
            console.error("Error fetching registrations:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            await Promise.all([
                loadDrivers(),
                loadVehicles(),
                loadViolations(),
                loadRegistrations()
            ]);

            setError(null);

        } catch (err) {
            console.error("Error fetching global data:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <DataContext.Provider
            value={{
                drivers,
                setDrivers,

                vehicles,
                setVehicles,

                violations,
                setViolations,

                registrations,
                setRegistrations,

                loading,
                error,

                loadDrivers,
                loadVehicles,
                loadViolations,
                loadRegistrations,
                loadData
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    return useContext(DataContext);
}