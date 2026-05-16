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

export const getDashboardStats = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();

    const violationsByTypeQuery = `
      SELECT vt.violation_type, CAST(COUNT(v.violation_id) AS INTEGER) AS total
      FROM violation v
      JOIN violation_type vt ON v.violation_id = vt.violation_id
      WHERE EXTRACT(YEAR FROM v.date) = $1
      GROUP BY vt.violation_type
      ORDER BY total DESC;
    `;

    const violationsOverTimeQuery = `
      SELECT 
        TO_CHAR(v.date, 'Mon') AS month,
        CAST(COUNT(*) AS INTEGER) AS total
      FROM violation v
      WHERE EXTRACT(YEAR FROM v.date) = $1
      GROUP BY month, EXTRACT(MONTH FROM v.date)
      ORDER BY EXTRACT(MONTH FROM v.date);
    `;

    const violationsByLocationQuery = `
      SELECT v.location as city, CAST(COUNT(*) AS INTEGER) AS total
      FROM violation v
      WHERE EXTRACT(YEAR FROM v.date) = $1
      GROUP BY v.location
      ORDER BY total DESC;
    `;

    const totalViolationsQuery = `
      SELECT CAST(COUNT(*) AS INTEGER) AS total
      FROM violation
      WHERE EXTRACT(YEAR FROM date) = $1;
    `;

    const [typesResult, timeResult, locResult, totalResult] = await Promise.all([
      pool.query(violationsByTypeQuery, [year]),
      pool.query(violationsOverTimeQuery, [year]),
      pool.query(violationsByLocationQuery, [year]),
      pool.query(totalViolationsQuery, [year])
    ]);

    res.json({
      violationsByType: typesResult.rows,
      violationsOverTime: timeResult.rows,
      violationsByLocation: locResult.rows,
      totalViolations: totalResult.rows[0]?.total || 0,
      mostCommonViolation: typesResult.rows[0]?.violation_type || 'N/A',
      mostCommonLocation: locResult.rows[0]?.city || 'N/A'
    });
  } catch (err) {
    console.error("DB Error (Dashboard):", err.message);
    res.status(500).json({ error: err.message });
  }
};

export async function searchViolation(req, res) {

  try {
    const { plate_number } = req.query;

    const query = `SELECT * FROM violation WHERE plate_number ILIKE $1`;

    const values = [`%${plate_number}%`];

    const result = await pool.query(query, values);
    
     res.json(result.rows);

  } catch (error) {

    res.status(500).json({success: false, error: error.message});

  }
}

export async function findDriverViolationsByDateRange(req, res) {
  try {
    const { license_number, start_date, end_date } = req.query;

    if (!license_number || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: "License number, start date, and end date are required",
      });
    }

    const query = `
      SELECT 
        d.license_number,
        d.full_name,
        d.license_status,
        d.license_type,
        v.violation_id,
        t.violation_type,
        v.violation_status,
        v.corresponding_fine_amount,
        v.apprehending_officer,
        v.date,
        v.location,
        v.plate_number
      FROM driver d
      JOIN violation v
        ON d.license_number = v.license_number
      JOIN violation_type t
        ON t.violation_id = v.violation_id
      WHERE d.license_number ILIKE $1
        AND v.date BETWEEN $2 AND $3
        AND t.violation_type ILIKE $4
      ORDER BY v.date DESC
    `;

    const values = [
      `%${license_number}%`,
      start_date,
      end_date,
      "Disregarding Traffic Signs",
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      violations: result.rows,
    });

  } catch (error) {
    console.error("Find driver violations error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}