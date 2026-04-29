import express from 'express';
import { getAllDrivers, createDriver, updateDriver, deleteDriver } from '../controllers/drivers.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllDrivers);
router.delete('/:license_number', authMiddleware, deleteDriver);
router.patch('/:license_number', authMiddleware, updateDriver);
router.post('/', authMiddleware, createDriver);

export default router;