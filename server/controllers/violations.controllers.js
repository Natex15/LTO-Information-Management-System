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