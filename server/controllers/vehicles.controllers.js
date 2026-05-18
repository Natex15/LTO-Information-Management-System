import pool from '../db/pool.js';

export const getAllVehicles = async (req, res) => {
  try {
    const conditions = [];
    const values = [];
    let idx = 1;

    // Search by plate number
    if (req.query.search) {
      conditions.push(`plate_number ILIKE $${idx}`);
      values.push(`%${req.query.search}%`);
      idx++;
    }

    let query = 'SELECT * FROM vehicle';
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Sorting
    const allowedSort = ['plate_number', 'make', 'model', 'year', 'color', 'vehicle_type', 'license_number'];
    if (req.query.sort_by && allowedSort.includes(req.query.sort_by)) {
      const order = req.query.sort_order === 'desc' ? 'DESC' : 'ASC';
      query += ` ORDER BY ${req.query.sort_by} ${order}`;
    } else {
      query += ' ORDER BY plate_number ASC';
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getVehiclesByLicense = async (req, res) => {
  try {
    const { license_number } = req.params;
    const result = await pool.query('SELECT * FROM vehicle WHERE license_number = $1', [license_number]);
    res.json(result.rows);
  } catch (err) {
    console.error("DB Error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export async function addVehicle(req, res) {
  try {
    const {plate_number, engine_number, chassis_number, color, make, model, year, vehicle_type, license_number} = req.body;

    const result = await pool.query(
      `INSERT INTO vehicle (plate_number, engine_number, chassis_number, color, make, model, year, vehicle_type, license_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [plate_number, engine_number, chassis_number, color, make, model, year, vehicle_type, license_number]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Add Vehicle Error:", error.message);
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Duplicate vehicle found. Plate number, engine number, or chassis number already exists."
      });
    }

    res.status(500).json({ error: error.message });
  }
}

export async function updateVehicle(req, res) {
  try {
    const {plate_number: old_plate_number} = req.params;

    const {plate_number, engine_number, chassis_number, color, make, model, year, vehicle_type, license_number} = req.body;

    const query = `UPDATE vehicle SET plate_number = $1, engine_number = $2, chassis_number = $3, color = $4, make = $5, model = $6, year = $7, vehicle_type = $8, license_number = $9
      WHERE plate_number = $10 RETURNING *`;

    
    const values = [plate_number, engine_number, chassis_number, color, make, model, year, vehicle_type, license_number, old_plate_number];

    const result = await pool.query(query, values);

    res.json(result.rows[0]);

  } catch (error) {
    if (error.code === "23505") {
      console.error("Update Vehicle Error:", error.message);
      return res.status(409).json({
        error: "Duplicate vehicle found. Engine number or chassis number already exists."
      });
    }

    res.status(500).json({ error: error.message });
  }
}

export async function deleteVehicle(req, res) {
  try {
    const {plate_number} = req.params;

    const result = await pool.query(
      "DELETE FROM vehicle WHERE plate_number = $1 RETURNING *",
      [plate_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({message: "Vehicle not found"});
    }

    res.json({message: "Vehicle deleted successfully"});
    
  } catch (error) {
    res.status(500).json({success: false, error: error.message});
  }
}

export async function getExpiredRegistrations(req, res) {
  try {
    const { date } = req.query;
    const result = await pool.query(
      `SELECT v.* FROM vehicle v JOIN registration r ON v.plate_number = r.plate_number WHERE r.expiration_date <= $1`, [date]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export async function getVehiclesByDriver(req, res) {
  try {
    const { driverName } = req.query;
    const result = await pool.query(
      `SELECT v.* FROM vehicle v
       JOIN driver d ON v.license_number = d.license_number
       WHERE d.full_name ILIKE $1`,
      [`%${driverName}%`]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
export async function searchVehicle(req, res) {

  try {
    const { plate_number } = req.query;

    const query = `SELECT * FROM vehicle WHERE plate_number ILIKE $1`;

    const values = [`%${plate_number}%`];

    const result = await pool.query(query, values);

     res.json(result.rows);

  } catch (error) {

    res.status(500).json({success: false, error: error.message});

  }
}

export async function findVehicleViolation(req, res) {
  try {
    const { location } = req.query;

    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required",
      });
    }

    const query = `
      SELECT
        v.plate_number,
        v.color,
        v.model,
        v.vehicle_type,
        STRING_AGG(t.violation_type, ', ') AS violation_types,
        i.location
      FROM vehicle v
      JOIN violation i
        ON v.plate_number = i.plate_number
      JOIN violation_type t
        ON t.violation_id = i.violation_id
      WHERE i.location ILIKE $1
      GROUP BY
        v.plate_number,
        v.color,
        v.model,
        v.vehicle_type,
        i.location
    `;

    const values = [`%${location}%`];

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      vehicles: result.rows,
    });

  } catch (error) {
    console.error("Find vehicle violation error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}
