export default function AddDriverModal({
    showModal,
    setShowModal,
    modalMode,
    setModalMode,
    formData,
    handleChange,
    handleCreateDriver,
}) {

    if (!showModal) return null;

    return (

        <div className="modalOverlay">

            <div className="modalBox">

                <h2>
                    {modalMode === "add" ? "Add Driver" : "Update Driver"}
                </h2>

                <form onSubmit={handleCreateDriver}>

                    <input
                        type="text"
                        name="license_number"
                        placeholder="License Number"
                        value={formData.license_number}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="full_name"
                        placeholder="Full Name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="sex"
                        value={formData.sex}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select Sex
                        </option>

                        <option value="Male">
                            Male
                        </option>

                        <option value="Female">
                            Female
                        </option>
                    </select>

                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />

                    <label>Date of Birth</label>

                    <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="track_license_number"
                        placeholder="Track License Number"
                        value={formData.track_license_number}
                        onChange={handleChange}
                    />

                    <select
                        name="license_status"
                        value={formData.license_status}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select Status
                        </option>

                        <option value="Valid">
                            Valid
                        </option>

                        <option value="Expired">
                            Expired
                        </option>

                        <option value="Suspended">
                            Suspended
                        </option>
                    </select>

                    <select
                        name="license_type"
                        value={formData.license_type}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Select License Type
                        </option>

                        <option value="Student Permit">
                            Student Permit
                        </option>

                        <option value="Non-Professional">
                            Non-Professional
                        </option>

                        <option value="Professional">
                            Professional
                        </option>
                    </select>

                    <label>Expiration Date</label>

                    <input
                        type="date"
                        name="expiration_date"
                        value={formData.expiration_date}
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