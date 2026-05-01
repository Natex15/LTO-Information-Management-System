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

                    <input
                        type="text"
                        name="vehicle_type"
                        placeholder="Vehicle Type"
                        value={formData.vehicle_type}
                        onChange={handleChange}
                        required
                    />

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
