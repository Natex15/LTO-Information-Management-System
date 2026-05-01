import pool from '../db/pool.js';

export const getAllVehicles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicle');
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
    const {plate_number,engine_number,chassis_number,color,model,year,vehicle_type,license_number} = req.body;

    const result = await pool.query(
      `INSERT INTO vehicle (plate_number,engine_number,chassis_number,color,model,year,vehicle_type,license_number)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [plate_number,engine_number,chassis_number,color,model,year,vehicle_type,license_number]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateVehicle(req,res){
  try{
    const {plate_number} = req.params;

    const {engine_number,chassis_number,color,model,year,vehicle_type,license_number} = req.body;

    const query = `UPDATE vehicle SET engine_number = $1, chassis_number = $2, color = $3, model = $4,year = $5,vehicle_type = $6,license_number = $7
      WHERE plate_number = $8 RETURNING *`;

    const values = [engine_number,chassis_number,color,model,year,vehicle_type,license_number,plate_number];

    const result = await pool.query(query, values);

    res.json(result.rows[0]);

  }catch(error){
    res.status(500).json({ error: error.message });
  }
}

export async function deleteVehicle(req, res){
  try{
    const {plate_number} = req.params;

    const result = await pool.query(
      "DELETE FROM vehicle WHERE plate_number = $1 RETURNING *",
      [plate_number]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({message: "Vehicle not found"});
    }

    res.json({message: "Vehicle deleted successfully"});
    
  }catch(error){
    res.status(500).json({success: false, error: error.message});
  }
}