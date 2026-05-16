import express from 'express';
import { getAllViolations, getViolationsByLicense, getDashboardStats, searchViolation, findDriverViolationsByDateRange } from '../controllers/violations.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/search', authMiddleware, searchViolation);
router.get("/driver-violations/date-range", findDriverViolationsByDateRange);
router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/', authMiddleware, getAllViolations);
router.get('/:license_number', authMiddleware, getViolationsByLicense);

export default router;