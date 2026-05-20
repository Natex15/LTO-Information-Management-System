import pool from '../db/pool.js';

// Get all violations
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

// Getting violations by license num
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

    // Validators
    if (license_number.length !== 13) {
      return res.status(400).json({
        success: false,
        error: "License number must be exactly 13 characters long."
      });
    }

    // License number validators
    const plateLength = plate_number.length;

    if (plateLength !== 4 && plateLength !== 5 && plateLength !== 7) {
      return res.status(400).json({
        error: "Plate number must be 3 letters followed by 1, 2, or 4 numbers."
      });
    }

    const firstThree = plate_number.slice(0, 3);
    const remaining = plate_number.slice(3);

    // Check first 3 characters are letters
    for (let i = 0; i < firstThree.length; i++) {
      const char = firstThree[i];

      if (char < "A" || char > "Z") {
        return res.status(400).json({
          error: "Plate number must start with exactly 3 letters."
        });
      }
    }

    // Check remaining characters are numbers
    for (let i = 0; i < remaining.length; i++) {
      const char = remaining[i];

      if (char < "0" || char > "9") {
        return res.status(400).json({
          error: "Plate number must end with numbers only."
        });
      }
    }

    // Only allow 1, 2, or 4 numbers after the letters
    if (
      remaining.length !== 1 &&
      remaining.length !== 2 &&
      remaining.length !== 4
    ) {
      return res.status(400).json({
        error: "Plate number must be 3 letters followed by 1, 2, or 4 numbers."
      });
    }

    // Check if the vehicle belongs to the driver
    const vehicleOwnerResult = await pool.query(
      `SELECT * FROM vehicle 
       WHERE plate_number = $1 
       AND license_number = $2`,
      [plate_number, license_number]
    );

    if (vehicleOwnerResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: "This vehicle does not belong to the selected driver."
      });
    }

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

    // Same validators
    if (license_number.length !== 13) {
      return res.status(400).json({
        success: false,
        error: "License number must be exactly 13 characters long."
      });
    }

    const plateLength = plate_number.length;

    if (plateLength !== 4 && plateLength !== 5 && plateLength !== 7) {
      return res.status(400).json({
        error: "Plate number must be 3 letters followed by 1, 2, or 4 numbers."
      });
    }

    const firstThree = plate_number.slice(0, 3);
    const remaining = plate_number.slice(3);

    // Check first 3 characters are letters
    for (let i = 0; i < firstThree.length; i++) {
      const char = firstThree[i];

      if (char < "A" || char > "Z") {
        return res.status(400).json({
          error: "Plate number must start with exactly 3 letters."
        });
      }
    }

    // Check remaining characters are numbers
    for (let i = 0; i < remaining.length; i++) {
      const char = remaining[i];

      if (char < "0" || char > "9") {
        return res.status(400).json({
          error: "Plate number must end with numbers only."
        });
      }
    }

    // Only allow 1, 2, or 4 numbers after the letters
    if (
      remaining.length !== 1 &&
      remaining.length !== 2 &&
      remaining.length !== 4
    ) {
      return res.status(400).json({
        error: "Plate number must be 3 letters followed by 1, 2, or 4 numbers."
      });
    }

    // Check if the vehicle belongs to the driver
    const vehicleOwnerResult = await pool.query(
      `SELECT * FROM vehicle 
       WHERE plate_number = $1 
       AND license_number = $2`,
      [plate_number, license_number]
    );

    if (vehicleOwnerResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: "This vehicle does not belong to the selected driver."
      });
    }

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

export async function getViolationYears(req, res) {
  try {
    const result = await pool.query(
      `SELECT DISTINCT EXTRACT(YEAR FROM date):: int AS year FROM violation ORDER BY year DESC`
    );
    res.json(result.rows.map(r => r.year));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getViolationCountByType(req, res) {
  try {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: "Year is required" });

    const result = await pool.query(
      `SELECT vt.violation_type, COUNT(*) AS count FROM violation v JOIN violation_type vt ON vt.violation_id = v.violation_id WHERE EXTRACT(YEAR FROM v.date) = $1 GROUP BY vt.violation_type ORDER BY count DESC`, [year]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
