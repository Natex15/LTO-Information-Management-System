import pool from '../db/pool.js';

// Report 1: All registered drivers filtered by license_type, license_status, sex, age range
export const getFilteredDrivers = async (req, res) => {
  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    if (req.query.license_type) {
      conditions.push(`license_type = $${idx}`);
      values.push(req.query.license_type);
      idx++;
    }
    if (req.query.license_status) {
      conditions.push(`license_status = $${idx}`);
      values.push(req.query.license_status);
      idx++;
    }
    if (req.query.sex) {
      conditions.push(`sex = $${idx}`);
      values.push(req.query.sex);
      idx++;
    }
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

    let query = `SELECT *, EXTRACT(YEAR FROM AGE(date_of_birth)) AS age FROM driver`;
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY full_name ASC';

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Report 1 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Report 2: All vehicles owned by a given driver
export const getVehiclesByDriver = async (req, res) => {
  try {
    const { license_number } = req.params;
    const result = await pool.query(
      `SELECT v.*, d.full_name as owner_name
       FROM vehicle v
       JOIN driver d ON v.license_number = d.license_number
       WHERE v.license_number = $1
       ORDER BY v.plate_number ASC`,
      [license_number]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Report 2 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Report 3: All vehicles with expired registrations as of a given date
export const getExpiredRegistrationVehicles = async (req, res) => {
  try {
    const asOfDate = req.query.as_of_date || new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT v.*, r.registration_number, r.registration_date, r.expiration_date, r.registration_status
       FROM vehicle v
       JOIN vehicle_registration r ON v.plate_number = r.plate_number
       WHERE r.expiration_date < $1
       ORDER BY r.expiration_date ASC`,
      [asOfDate]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Report 3 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Report 4: All drivers with expired or suspended licenses
export const getExpiredSuspendedDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *, EXTRACT(YEAR FROM AGE(date_of_birth)) AS age
       FROM driver
       WHERE license_status IN ('Expired', 'Suspended')
       ORDER BY full_name ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Report 4 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Report 5: All violations by a driver within a date range
export const getViolationsByDriverDateRange = async (req, res) => {
  try {
    const { license_number } = req.params;
    const { start_date, end_date } = req.query;

    const conditions = [`v.license_number = $1`];
    const values = [license_number];
    let idx = 2;

    if (start_date) {
      conditions.push(`v.date >= $${idx}`);
      values.push(start_date);
      idx++;
    }
    if (end_date) {
      conditions.push(`v.date <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const result = await pool.query(
      `SELECT v.*,
        d.full_name,
        COALESCE((SELECT array_agg(vt.violation_type) FROM violation_type vt WHERE vt.violation_id = v.violation_id), '{}') as violation_types
       FROM violation v
       JOIN driver d ON v.license_number = d.license_number
       WHERE ${conditions.join(' AND ')}
       ORDER BY v.date DESC`,
      values
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Report 5 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Report 6: Total violations per type for a given year
export const getViolationCountByType = async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const result = await pool.query(
      `SELECT vt.violation_type, CAST(COUNT(v.violation_id) AS INTEGER) AS total
       FROM violation v
       JOIN violation_type vt ON v.violation_id = vt.violation_id
       WHERE EXTRACT(YEAR FROM v.date) = $1
       GROUP BY vt.violation_type
       ORDER BY total DESC`,
      [year]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Report 6 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

// Report 7: All vehicles involved in violations within a given city/region
export const getVehiclesWithViolationsByLocation = async (req, res) => {
  try {
    const location = req.query.location || '';
    const result = await pool.query(
      `SELECT DISTINCT v.*, vi.location, vi.date as violation_date,
        COALESCE((SELECT array_agg(vt.violation_type) FROM violation_type vt WHERE vt.violation_id = vi.violation_id), '{}') as violation_types
       FROM vehicle v
       JOIN violation vi ON v.plate_number = vi.plate_number
       WHERE vi.location ILIKE $1
       ORDER BY v.plate_number ASC`,
      [`%${location}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Report 7 Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
