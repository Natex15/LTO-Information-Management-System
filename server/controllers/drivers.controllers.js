import pool from '../db/pool.js';

export const getAllDrivers = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM driver');
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export async function createDriver(req, res) {
  try {
    const {license_number, full_name, sex, license_status, expiration_date, address, date_of_birth, license_type, track_license_number} = req.body;

    const result = await pool.query(
      `INSERT INTO driver (license_number, full_name, sex, license_status, expiration_date, address, date_of_birth, license_type, track_license_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [license_number, full_name, sex, license_status, expiration_date, address, date_of_birth, license_type, track_license_number]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateDriver(req, res) {
  try {

    const { license_number } = req.params;

    const {full_name, sex, address, date_of_birth, track_license_number, license_status, license_type, expiration_date} = req.body;

    const query = `UPDATE driver SET full_name = $1, sex = $2, address = $3, date_of_birth = $4,track_license_number = $5,license_status = $6,license_type = $7,expiration_date = $8
      WHERE license_number = $9 RETURNING *`;

    const values = [full_name,sex,address,date_of_birth,track_license_number,license_status,license_type,expiration_date,license_number];

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

export async function searchDriver(req, res) {

  try {
    const { driverName } = req.query;

    const query = `SELECT * FROM driver WHERE full_name ILIKE $1`;

    const values = [`%${driverName}%`];

    const result = await pool.query(query, values);

     res.json(result.rows);

  } catch (error) {

    res.status(500).json({success: false, error: error.message});

  }
}

export async function getDriverFilterOptions(req, res) {
  try {
    const [licenseTypes, licenseStatuses, sexes] = await Promise.all([
      pool.query(`SELECT DISTINCT license_type FROM driver ORDER BY license_type`),
      pool.query(`SELECT DISTINCT license_status FROM driver ORDER BY license_status`),
      pool.query(`SELECT DISTINCT sex FROM driver ORDER BY sex`)
    ]);

    res.json({
      licenseTypes: licenseTypes.rows.map(r => r.license_type),
      licenseStatuses: licenseStatuses.rows.map(r => r.license_status),
      sexes: sexes.rows.map(r => r.sex)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function filterDrivers(req, res) {
  try {
    const { filter_type, filter_value, min_age, max_age } = req.query;

    let query, values;

    if (filter_type === "age_range") {
      query = `SELECT * FROM driver WHERE FLOOR(EXTRACT(YEAR FROM AGE(NOW(), date_of_birth))) BETWEEN $1 AND $2`;
      values = [min_age, max_age];
    } else if (filter_type === "license_type") {
      query = `SELECT * FROM driver WHERE license_type = $1`;
      values = [filter_value];
    } else if (filter_type === "license_status") {
      query = `SELECT * FROM driver WHERE license_status = $1`;
      values = [filter_value];
    } else if (filter_type === "sex") {
      query = `SELECT * FROM driver WHERE sex = $1`;
      values = [filter_value];
    } else {
      return res.status(400).json({ error: "Invalid filter type" });
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
