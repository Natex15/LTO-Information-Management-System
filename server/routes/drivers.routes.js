import express from 'express';
import { getAllDrivers } from '../controllers/drivers.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllDrivers);

export default router;