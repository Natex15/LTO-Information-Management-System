import pool from '../db/pool.js';

export const getAllViolations = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM violation');
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getViolationsByLicense = async (req, res) => {
  try {
    const { license_number } = req.params;
    const result = await pool.query('SELECT * FROM violation WHERE license_number = $1', [license_number]);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};