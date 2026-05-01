import express from 'express';
import { getAllViolations, getViolationsByLicense, getDashboardStats } from '../controllers/violations.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/dashboard', authMiddleware, getDashboardStats);
router.get('/', authMiddleware, getAllViolations);
router.get('/:license_number', authMiddleware, getViolationsByLicense);

export default router;