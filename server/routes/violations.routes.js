import express from 'express';
import { getAllViolations } from '../controllers/violations.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllViolations);

export default router;