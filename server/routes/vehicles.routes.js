import express from 'express';
import { getAllVehicles } from '../controllers/vehicles.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllVehicles);

export default router;