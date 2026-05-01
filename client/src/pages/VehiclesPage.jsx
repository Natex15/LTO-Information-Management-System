import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "./VehiclesPage.css";
import AddVehicleModal from "../components/AddVehicleModal";
import { useData } from "../context/DataContext";

export default function VehiclesPage() {
  const { vehicles, setVehicles, loading, error } = useData();
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [modalMode, setModalMode] = useState("add");

  const [formData, setFormData] = useState({
    plate_number: "",
    engine_number: "",
    chassis_number: "",
    color: "",
    model: "",
    year: "",
    vehicle_type: "",
    license_number: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create vehicle");
      }

      const data = await response.json();

      setVehicles((prev) => [...prev, data]);

      setShowModal(false);

      setFormData({
        plate_number: "",
        engine_number: "",
        chassis_number: "",
        color: "",
        model: "",
        year: "",
        vehicle_type: "",
        license_number: "",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteVehicle = async () => {
    if (!selectedVehicle) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `/api/vehicles/${selectedVehicle.plate_number}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete vehicle");
      }

      setVehicles((prev) =>
        prev.filter(
          (vehicle) => vehicle.plate_number !== selectedVehicle.plate_number,
        ),
      );

      setSelectedVehicle(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateVehicle = async () => {
    if (!selectedVehicle) {
      return;
    }

    setModalMode("update");

    setFormData({
      plate_number: selectedVehicle.plate_number,
      engine_number: selectedVehicle.engine_number,
      chassis_number: selectedVehicle.chassis_number,
      color: selectedVehicle.color,
      model: selectedVehicle.model,
      year: selectedVehicle.year,
      vehicle_type: selectedVehicle.vehicle_type,
      license_number: selectedVehicle.license_number,
    });

    setShowModal(true);
  };

  const handlePatchVehicle = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      return;
    }

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `/api/vehicles/${selectedVehicle.plate_number}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to update vehicle: ${response.status}`);
      }

      const updatedVehicle = await response.json();

      setVehicles((prev) =>
        prev.map((vehicle) =>
          vehicle.plate_number === selectedVehicle.plate_number
            ? updatedVehicle
            : vehicle,
        ),
      );

      setSelectedVehicle(null);
      setModalMode("add");
      setShowModal(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Sidebar />
      <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
        <div className="headerRow">
          <h2
            style={{
              marginBottom: "10px",
              userSelect: "none",
              fontSize: "30px",
              marginLeft: "11px",
              color: "#FFFFFF",
            }}
          >
            Registered Vehicles
          </h2>
          <div className="searchRow">
            <button className="sortBtn">Sort by</button>
            <input
              type="text"
              className="searchBar"
              placeholder="Search by plate number..."
            />
            <button
              className="addBtn"
              onClick={() => {
                setModalMode("add");
                setShowModal(true);
              }}
            >
              Add Vehicle
            </button>
            <button className="deleteBtn" onClick={handleDeleteVehicle}>
              {" "}
              Delete Vehicle
            </button>
            <button className="updateBtn" onClick={handleUpdateVehicle}>
              Update Vehicle
            </button>
          </div>
        </div>

        {error ? (
          <p style={{ color: "red" }}>Failed to load vehicles: {error}</p>
        ) : loading ? (
          <p>Loading vehicles...</p>
        ) : vehicles.length === 0 ? (
          <p>No vehicles found.</p>
        ) : (
          <div className="vehicleTableContainer">
            <div className="vehicleTable">
              <table>
                <thead>
                  <tr>
                    <th>Plate Number</th>
                    <th>Engine Number</th>
                    <th>Chassis Number</th>
                    <th>Color</th>
                    <th>Model</th>
                    <th>Year</th>
                    <th>Vehicle Type</th>
                    <th>License Number</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.plate_number}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className={
                        selectedVehicle?.plate_number === vehicle.plate_number
                          ? "selectedRow"
                          : ""
                      }
                    >
                      <td>{vehicle.plate_number}</td>
                      <td>{vehicle.engine_number}</td>
                      <td>{vehicle.chassis_number}</td>
                      <td>{vehicle.color}</td>
                      <td>{vehicle.model}</td>
                      <td>{vehicle.year}</td>
                      <td>{vehicle.vehicle_type}</td>
                      <td>{vehicle.license_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AddVehicleModal
        showModal={showModal}
        setShowModal={setShowModal}
        modalMode={modalMode}
        setModalMode={setModalMode}
        formData={formData}
        handleChange={handleChange}
        handleCreateVehicle={
          modalMode === "add" ? handleCreateVehicle : handlePatchVehicle
        }
      />
    </>
  );
}
