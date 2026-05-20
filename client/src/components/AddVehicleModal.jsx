export default function AddVehicleModal({
    showModal,
    setShowModal,
    modalMode,
    setModalMode,
    formData,
    handleChange,
    handleCreateVehicle,
}) {

    if (!showModal) return null;

    return (

        <div className="modalOverlay">

            <div className="modalBox">

                <h2>
                    {modalMode === "add" ? "Add Vehicle" : "Update Vehicle"}
                </h2>

                <form onSubmit={handleCreateVehicle}>

                    <input
                        type="text"
                        name="plate_number"
                        placeholder="Plate Number"
                        value={formData.plate_number}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="engine_number"
                        placeholder="Engine Number"
                        value={formData.engine_number}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="chassis_number"
                        placeholder="Chassis Number"
                        value={formData.chassis_number}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="color"
                        placeholder="Color"
                        value={formData.color}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="make"
                        placeholder="Make"
                        value={formData.make}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="model"
                        placeholder="Model"
                        value={formData.model}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="year"
                        placeholder="Year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="vehicle_type"
                        value={formData.vehicle_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select Vehicle Type</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Tricycle">Tricycle</option>
                        <option value="M1 Vehicle">M1 Vehicle (Not More Than 8 seats)</option>
                        <option value="M2 Vehicle">M2 Vehicle (More Than 8 Seats)</option>
                        <option value="Light & Heavy Commercial Vehicle">Light & Heavy Commercial Vehicle</option>
                        <option value="Passenger Vehicle">Passenger Vehicle</option>
                        <option value="Articulated Passenger Car">Articulated Passenger Car</option>
                        <option value="Heavy Articulated Vehicle">Heavy Articulated Vehicle</option>
                    </select>

                    <input
                        type="text"
                        name="license_number"
                        placeholder="License Number"
                        value={formData.license_number}
                        onChange={handleChange}
                        required
                    />

                    <div className="modalActions">

                        <button
                            type="submit"
                            className="saveBtn"
                        >
                            Save
                        </button>

                        <button
                            type="button"
                            className="cancelBtn"
                            onClick={() => {
                                setShowModal(false);
                                setModalMode("add");
                            }}
                        >
                            Cancel
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
}
