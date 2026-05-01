import express from 'express';
import { getAllVehicles, getVehiclesByLicense, addVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicles.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllVehicles);
router.get('/:license_number', authMiddleware, getVehiclesByLicense);
router.post('/', authMiddleware, addVehicle);
router.patch('/:plate_number', authMiddleware, updateVehicle);
router.delete('/:plate_number', authMiddleware, deleteVehicle);

export default router;