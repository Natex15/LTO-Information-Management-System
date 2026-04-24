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