import pool from '../db/pool.js';

export const getAllViolations = async (req, res) => {
  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    // Search by plate number or license number
    if (req.query.search) {
      conditions.push(`(v.plate_number ILIKE $${idx} OR v.license_number ILIKE $${idx} OR v.apprehending_officer ILIKE $${idx})`);
      values.push(`%${req.query.search}%`);
      idx++;
    }

    let query = `
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

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    const allowedSort = ['violation_id', 'date', 'location', 'corresponding_fine_amount', 'violation_status', 'license_number', 'plate_number'];
    if (req.query.sort_by && allowedSort.includes(req.query.sort_by)) {
      const order = req.query.sort_order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY v.${req.query.sort_by} ${order}`;
    } else {
      query += ' ORDER BY v.date DESC';
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getViolationsByLicense = async (req, res) => {
  try {
    const { license_number } = req.params;
    const conditions = [`v.license_number = $1`];
    const values = [license_number];
    let idx = 2;

    // Optional date range for report #5
    if (req.query.start_date) {
      conditions.push(`v.date >= $${idx}`);
      values.push(req.query.start_date);
      idx++;
    }
    if (req.query.end_date) {
      conditions.push(`v.date <= $${idx}`);
      values.push(req.query.end_date);
      idx++;
    }

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
      WHERE ${conditions.join(' AND ')}
      ORDER BY v.date DESC
    `;
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// CREATE a violation
export const createViolation = async (req, res) => {
  try {
    const { date, location, corresponding_fine_amount, apprehending_officer, violation_status, license_number, plate_number, violation_types } = req.body;

    const result = await pool.query(
      `INSERT INTO violation (date, location, corresponding_fine_amount, apprehending_officer, violation_status, license_number, plate_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [date, location, corresponding_fine_amount, apprehending_officer, violation_status || 'Unpaid', license_number, plate_number]
    );

    const newViolation = result.rows[0];

    // Insert violation types
    if (violation_types && violation_types.length > 0) {
      for (const type of violation_types) {
        await pool.query(
          `INSERT INTO violation_type (violation_id, violation_type) VALUES ($1, $2)`,
          [newViolation.violation_id, type]
        );
      }
    }

    // Re-fetch with types
    const fullResult = await pool.query(
      `SELECT v.*,
        COALESCE((SELECT array_agg(vt.violation_type) FROM violation_type vt WHERE vt.violation_id = v.violation_id), '{}') as violation_types
      FROM violation v WHERE v.violation_id = $1`,
      [newViolation.violation_id]
    );

    res.json(fullResult.rows[0]);
  } catch (error) {
    console.error("Create Violation Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// UPDATE a violation (status change, or full edit)
export const updateViolation = async (req, res) => {
  try {
    const { violation_id } = req.params;
    const { date, location, corresponding_fine_amount, apprehending_officer, violation_status, license_number, plate_number, violation_types } = req.body;

    const query = `UPDATE violation SET date = $1, location = $2, corresponding_fine_amount = $3, apprehending_officer = $4, violation_status = $5, license_number = $6, plate_number = $7
      WHERE violation_id = $8 RETURNING *`;

    const values = [date, location, corresponding_fine_amount, apprehending_officer, violation_status, license_number, plate_number, violation_id];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Violation not found" });
    }

    // Update violation types: delete old, insert new
    if (violation_types) {
      await pool.query(`DELETE FROM violation_type WHERE violation_id = $1`, [violation_id]);
      for (const type of violation_types) {
        await pool.query(
          `INSERT INTO violation_type (violation_id, violation_type) VALUES ($1, $2)`,
          [violation_id, type]
        );
      }
    }

    // Re-fetch with types
    const fullResult = await pool.query(
      `SELECT v.*,
        COALESCE((SELECT array_agg(vt.violation_type) FROM violation_type vt WHERE vt.violation_id = v.violation_id), '{}') as violation_types
      FROM violation v WHERE v.violation_id = $1`,
      [violation_id]
    );

    res.json(fullResult.rows[0]);
  } catch (error) {
    console.error("Update Violation Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};

// DELETE a violation
export const deleteViolation = async (req, res) => {
  try {
    const { violation_id } = req.params;

    const result = await pool.query(
      "DELETE FROM violation WHERE violation_id = $1 RETURNING *",
      [violation_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Violation not found" });
    }

    res.json({ message: "Violation deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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