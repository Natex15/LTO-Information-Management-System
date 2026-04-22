import express from 'express';
import { getAllDrivers } from '../controllers/drivers.controllers.js';

const router = express.Router();

router.get('/', getAllDrivers);

export default router;