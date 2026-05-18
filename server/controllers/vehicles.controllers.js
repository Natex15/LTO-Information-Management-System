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
    res.status(500).json({ error: error.message });
  }
}

export async function updateVehicle(req, res) {
  try {
    const {plate_number} = req.params;

    const {engine_number, chassis_number, color, make, model, year, vehicle_type, license_number} = req.body;

    const query = `UPDATE vehicle SET engine_number = $1, chassis_number = $2, color = $3, make = $4, model = $5, year = $6, vehicle_type = $7, license_number = $8
      WHERE plate_number = $9 RETURNING *`;

    const values = [engine_number, chassis_number, color, make, model, year, vehicle_type, license_number, plate_number];

    const result = await pool.query(query, values);

    res.json(result.rows[0]);

  } catch (error) {
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