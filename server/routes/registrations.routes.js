import express from 'express';
import { 
  getAllRegistrations, 
  getRegistrationsByPlate, 
  createRegistration, 
  updateRegistration, 
  deleteRegistration,
  getExpiredRegistrations 
} from '../controllers/registrations.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllRegistrations);
router.get('/expired', authMiddleware, getExpiredRegistrations);
router.get('/vehicle/:plate_number', authMiddleware, getRegistrationsByPlate);
router.post('/', authMiddleware, createRegistration);
router.patch('/:registration_number', authMiddleware, updateRegistration);
router.delete('/:registration_number', authMiddleware, deleteRegistration);

export default router;
