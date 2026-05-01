import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DriversPage from "./pages/DriversPage";
import VehiclesPage from "./pages/VehiclesPage";
import ViolationsPage from "./pages/ViolationsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { DataProvider } from "./context/DataContext";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <DataProvider>
              <Outlet />
            </DataProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/violations" element={<ViolationsPage />} />
      </Route>
    </Routes>
  );
}

export default App;
