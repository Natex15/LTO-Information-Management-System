import express from 'express';
import {
  getFilteredDrivers,
  getVehiclesByDriver,
  getExpiredRegistrationVehicles,
  getExpiredSuspendedDrivers,
  getViolationsByDriverDateRange,
  getViolationCountByType,
  getVehiclesWithViolationsByLocation
} from '../controllers/reports.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/drivers', authMiddleware, getFilteredDrivers);
router.get('/drivers/expired-suspended', authMiddleware, getExpiredSuspendedDrivers);
router.get('/drivers/:license_number/vehicles', authMiddleware, getVehiclesByDriver);
router.get('/registrations/expired', authMiddleware, getExpiredRegistrationVehicles);
router.get('/drivers/:license_number/violations', authMiddleware, getViolationsByDriverDateRange);
router.get('/violations/by-type', authMiddleware, getViolationCountByType);
router.get('/violations/by-location', authMiddleware, getVehiclesWithViolationsByLocation);

export default router;
