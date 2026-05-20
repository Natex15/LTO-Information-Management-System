import pool from '../db/pool.js';

// GET all registrations (with optional search)
export const getAllRegistrations = async (req, res) => {
  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (req.query.search) {
      conditions.push(`(r.registration_number ILIKE $${idx} OR r.plate_number ILIKE $${idx})`);
      values.push(`%${req.query.search}%`);
      idx++;
    }

    if (req.query.status) {
      conditions.push(`r.registration_status = $${idx}`);
      values.push(req.query.status);
      idx++;
    }

    let query = `
      SELECT r.*, v.make, v.model, v.year, v.vehicle_type, v.license_number
      FROM vehicle_registration r
      JOIN vehicle v ON r.plate_number = v.plate_number
    `;

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const allowedSort = ['registration_number', 'plate_number', 'registration_date', 'expiration_date', 'registration_status'];
    if (req.query.sort_by && allowedSort.includes(req.query.sort_by)) {
      const order = req.query.sort_order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY r.${req.query.sort_by} ${order}`;
    } else {
      query += ' ORDER BY r.registration_date DESC';
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// GET registration history for a specific vehicle
export const getRegistrationsByPlate = async (req, res) => {
  try {
    const { plate_number } = req.params;
    const result = await pool.query(
      `SELECT * FROM vehicle_registration WHERE plate_number = $1 ORDER BY registration_date DESC`,
      [plate_number]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// CREATE a new registration/renewal
export const createRegistration = async (req, res) => {
  try {
    const {
      registration_number,
      plate_number,
      registration_date,
      expiration_date,
      registration_status
    } = req.body;

    // Validators
    if (!registration_number || registration_number.length !== 13) {
      return res.status(400).json({
        success: false,
        error: "Registration number must be exactly 13 characters long."
      });
    }

    const regDate = new Date(registration_date);
    const expDate = new Date(expiration_date);

    if (isNaN(regDate.getTime()) || isNaN(expDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format."
      });
    }

    // If registration date is later than expiration date
    if (regDate > expDate) {
      return res.status(400).json({
        success: false,
        error: "Registration date cannot be later than expiration date."
      });
    }

    // Validator if according to date the registration is still active/suspended, but expired is selected
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cleanExpDate = new Date(expDate);
    cleanExpDate.setHours(0, 0, 0, 0);

    if (registration_status === "Expired" && cleanExpDate >= today) {
      return res.status(400).json({
        success: false,
        error: "Registration status cannot be Expired if the expiration date has not passed yet."
      });
    }

    await pool.query(
      `INSERT INTO vehicle_registration 
      (registration_number, plate_number, registration_date, expiration_date, registration_status)
      VALUES ($1, $2, $3, $4, $5)`,
      [
        registration_number,
        plate_number,
        registration_date,
        expiration_date,
        registration_status || "Active"
      ]
    );

    const fullResult = await pool.query(
      `SELECT 
        vr.registration_number,
        vr.plate_number,
        vr.registration_date,
        vr.expiration_date,
        vr.registration_status,
        v.make,
        v.model,
        v.year,
        v.vehicle_type
      FROM vehicle_registration vr
      LEFT JOIN vehicle v
        ON vr.plate_number = v.plate_number
      WHERE vr.registration_number = $1`,
      [registration_number]
    );

    res.json(fullResult.rows[0]);
  } catch (error) {
    console.error("Create Registration Error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        error: "Duplicate registration number."
      });
    }

    res.status(500).json({ error: error.message });
  }
};

// UPDATE registration status
export const updateRegistration = async (req, res) => {
  try {
    const { registration_number } = req.params;
    const {
      plate_number,
      registration_date,
      expiration_date,
      registration_status
    } = req.body;

    // Same Validators
    if (!registration_number || registration_number.length !== 13) {
      return res.status(400).json({
        success: false,
        error: "Registration number must be exactly 13 characters long."
      });
    }

    const regDate = new Date(registration_date);
    const expDate = new Date(expiration_date);

    if (isNaN(regDate.getTime()) || isNaN(expDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format."
      });
    }

    if (regDate > expDate) {
      return res.status(400).json({
        success: false,
        error: "Registration date cannot be later than expiration date."
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const cleanExpDate = new Date(expDate);
    cleanExpDate.setHours(0, 0, 0, 0);

    if (registration_status === "Expired" && cleanExpDate >= today) {
      return res.status(400).json({
        success: false,
        error: "Registration status cannot be Expired if the expiration date has not passed yet."
      });
    }

    const result = await pool.query(
      `UPDATE vehicle_registration 
      SET plate_number = $1, 
          registration_date = $2, 
          expiration_date = $3, 
          registration_status = $4
      WHERE registration_number = $5 
      RETURNING *`,
      [
        plate_number,
        registration_date,
        expiration_date,
        registration_status,
        registration_number
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Registration not found"
      });
    }

    const fullResult = await pool.query(
      `SELECT 
        vr.registration_number,
        vr.plate_number,
        vr.registration_date,
        vr.expiration_date,
        vr.registration_status,
        v.make,
        v.model,
        v.year,
        v.vehicle_type
      FROM vehicle_registration vr
      LEFT JOIN vehicle v
        ON vr.plate_number = v.plate_number
      WHERE vr.registration_number = $1`,
      [registration_number]
    );

    res.json(fullResult.rows[0]);
  } catch (error) {
    console.error("Update Registration Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE a registration
export const deleteRegistration = async (req, res) => {
  try {
    const { registration_number } = req.params;

    const result = await pool.query(
      "DELETE FROM vehicle_registration WHERE registration_number = $1 RETURNING *",
      [registration_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.json({ message: "Registration deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Report: vehicles with expired registrations as of a given date
export const getExpiredRegistrations = async (req, res) => {
  try {
    const asOfDate = req.query.as_of_date || new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT r.*, v.make, v.model, v.year, v.vehicle_type, v.license_number
       FROM vehicle_registration r
       JOIN vehicle v ON r.plate_number = v.plate_number
       WHERE r.expiration_date < $1
       ORDER BY r.expiration_date DESC`,
      [asOfDate]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
