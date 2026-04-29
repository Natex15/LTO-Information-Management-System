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