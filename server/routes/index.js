import express from 'express';
import authRoutes from './auth.routes.js';
import driversRoutes from './drivers.routes.js';
import vehiclesRoutes from './vehicles.routes.js';
import violationsRoutes from './violations.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/drivers', driversRoutes);
router.use('/vehicles', vehiclesRoutes);
router.use('/violations', violationsRoutes);

export default router;