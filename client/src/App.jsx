import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DriversPage from "./pages/DriversPage";
import VehiclesPage from "./pages/VehiclesPage";
import ViolationsPage from "./pages/ViolationsPage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/drivers" element={<ProtectedRoute><DriversPage /></ProtectedRoute>} />
                <Route path="/vehicles" element={<ProtectedRoute><VehiclesPage /></ProtectedRoute>} />
                <Route path="/violations" element={<ProtectedRoute><ViolationsPage /></ProtectedRoute>} />
            </Routes>
    );
}

export default App;