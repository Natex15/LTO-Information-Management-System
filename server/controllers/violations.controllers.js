import pool from '../db/pool.js';

export const getAllViolations = async (req, res) => {
  try {
    const query = `
      SELECT 
        v.*,
        COALESCE(
          (SELECT array_agg(vt.violation_type) 
           FROM violation_type vt 
           WHERE vt.violation_id = v.violation_id), 
          '{}'
        ) as violation_types
      FROM violation v
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getViolationsByLicense = async (req, res) => {
  try {
    const { license_number } = req.params;
    const query = `
      SELECT 
        v.*,
        COALESCE(
          (SELECT array_agg(vt.violation_type) 
           FROM violation_type vt 
           WHERE vt.violation_id = v.violation_id), 
          '{}'
        ) as violation_types
      FROM violation v
      WHERE v.license_number = $1
    `;
    const result = await pool.query(query, [license_number]);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};