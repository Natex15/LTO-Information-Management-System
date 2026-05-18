import pool from '../db/pool.js';

export const getAllDrivers = async (req, res) => {
  try {
    // Build dynamic WHERE clauses from query params
    const conditions = [];
    const values = [];
    let idx = 1;

    // Search by name
    if (req.query.search) {
      conditions.push(`full_name ILIKE $${idx}`);
      values.push(`%${req.query.search}%`);
      idx++;
    }

    // Filter by license_type
    if (req.query.license_type) {
      conditions.push(`license_type = $${idx}`);
      values.push(req.query.license_type);
      idx++;
    }

    // Filter by license_status
    if (req.query.license_status) {
      conditions.push(`license_status = $${idx}`);
      values.push(req.query.license_status);
      idx++;
    }

    // Filter by sex
    if (req.query.sex) {
      conditions.push(`sex = $${idx}`);
      values.push(req.query.sex);
      idx++;
    }

    // Filter by age range
    if (req.query.min_age) {
      conditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) >= $${idx}`);
      values.push(Number(req.query.min_age));
      idx++;
    }
    if (req.query.max_age) {
      conditions.push(`EXTRACT(YEAR FROM AGE(date_of_birth)) <= $${idx}`);
      values.push(Number(req.query.max_age));
      idx++;
    }

    let query = 'SELECT * FROM driver';
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    const allowedSort = ['full_name', 'license_number', 'date_of_birth', 'license_status', 'license_type', 'expiration_date', 'issuance_date'];
    if (req.query.sort_by && allowedSort.includes(req.query.sort_by)) {
      const order = req.query.sort_order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${req.query.sort_by} ${order}`;
    } else {
      query += ' ORDER BY full_name ASC';
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Report: drivers with expired or suspended licenses
export const getExpiredSuspendedDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM driver WHERE license_status IN ('Expired', 'Suspended') ORDER BY full_name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export async function createDriver(req, res) {
  try {
    const {license_number, full_name, sex, license_status, expiration_date, address, date_of_birth, license_type, issuance_date} = req.body;

    const result = await pool.query(
      `INSERT INTO driver (license_number, full_name, sex, license_status, expiration_date, address, date_of_birth, license_type, issuance_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [license_number, full_name, sex, license_status, expiration_date, address, date_of_birth, license_type, issuance_date || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateDriver(req, res) {
  try {

    const { license_number } = req.params;

    const {full_name, sex, address, date_of_birth, issuance_date, license_status, license_type, expiration_date} = req.body;

    const query = `UPDATE driver SET full_name = $1, sex = $2, address = $3, date_of_birth = $4, issuance_date = $5, license_status = $6, license_type = $7, expiration_date = $8
      WHERE license_number = $9 RETURNING *`;

    const values = [full_name, sex, address, date_of_birth, issuance_date || null, license_status, license_type, expiration_date, license_number];

    const result = await pool.query(query, values);

    res.json(result.rows[0]);

  } catch (error) {

    res.status(500).json({ error: error.message });

  }
}

export async function deleteDriver(req, res) {

  try {

    const { license_number } = req.params;

    const result = await pool.query(
      "DELETE FROM driver WHERE license_number = $1 RETURNING *",
      [license_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({message: "Driver not found"});
    }

    res.json({message: "Driver deleted successfully"});

  } catch (error) {

    res.status(500).json({success: false, error: error.message});

  }

}